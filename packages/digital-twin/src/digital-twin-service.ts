import type { MembershipTier } from '@ai-pass/shared';
import { GoogleCalendarStubConnector } from './calendar/google-calendar-stub.js';
import { MockCalendarConnector } from './calendar/mock-calendar.js';
import type { CalendarConnector } from './calendar/types.js';
import {
  canSyncCalendar,
  canUseMemoryCategories,
  defaultTwinUsageTracker,
} from './membership-gates.js';
import { executeTwinPrompt } from './provider-hub-bridge.js';
import { getTwinLimits } from './twin-limits.js';
import { defaultTwinMemoryStore, TwinMemoryStore } from './twin-memory-store.js';
import { defaultTwinPersonality, TwinPersonality } from './twin-personality.js';
import type {
  CalendarConnection,
  CalendarEvent,
  TwinChatRequest,
  TwinChatResponse,
  TwinMemoryCategory,
  TwinMemoryEntry,
  TwinUserProfile,
} from './types.js';

const DEFAULT_PROFILE: Omit<TwinUserProfile, 'userId'> = {
  displayName: 'You',
  timezone: 'Europe/Berlin',
  preferences: {
    tone: 'friendly',
    proactiveReminders: true,
    speechEnabled: false,
    memoryCategoriesEnabled: ['private', 'business', 'connections'],
  },
};

export class DigitalTwinService {
  constructor(
    private memory: TwinMemoryStore = defaultTwinMemoryStore,
    private personality: TwinPersonality = defaultTwinPersonality,
    private mockCalendar: CalendarConnector = new MockCalendarConnector(),
    private googleCalendar: CalendarConnector = new GoogleCalendarStubConnector(),
  ) {}

  getProfile(userId: string, displayName?: string): TwinUserProfile {
    return {
      userId,
      displayName: displayName ?? DEFAULT_PROFILE.displayName,
      timezone: DEFAULT_PROFILE.timezone,
      preferences: { ...DEFAULT_PROFILE.preferences },
    };
  }

  getLimits(tier: MembershipTier) {
    return getTwinLimits(tier);
  }

  getUsage(userId: string) {
    return defaultTwinUsageTracker.getUsage(userId);
  }

  listMemory(userId: string): TwinMemoryEntry[] {
    return this.memory.getAll(userId);
  }

  saveMemory(
    userId: string,
    entry: { category: TwinMemoryCategory; key: string; value: string; consentGranted: boolean; id?: string },
  ): TwinMemoryEntry {
    return this.memory.upsert(userId, entry);
  }

  setMemoryConsent(userId: string, category: TwinMemoryCategory, granted: boolean): TwinMemoryEntry[] {
    return this.memory.setConsent(userId, category, granted);
  }

  async listCalendarConnections(userId: string, tier: MembershipTier): Promise<CalendarConnection[]> {
    if (!canSyncCalendar(tier)) {
      return [];
    }
    const mock = await this.mockCalendar.listConnections(userId);
    const google = await this.googleCalendar.listConnections(userId);
    return [...mock, ...google];
  }

  async listTodayEvents(userId: string, tier: MembershipTier, date?: string): Promise<CalendarEvent[]> {
    const today = date ?? new Date().toISOString().slice(0, 10);
    if (!canSyncCalendar(tier)) {
      return [];
    }
    const googleEvents = await this.googleCalendar.listEvents(userId, today);
    if (googleEvents.length > 0) return googleEvents;
    return this.mockCalendar.listEvents(userId, today);
  }

  getGoogleOAuthUrl(userId: string): string {
    const stub = this.googleCalendar as GoogleCalendarStubConnector;
    return stub.getOAuthUrl(userId);
  }

  async chat(params: TwinChatRequest): Promise<TwinChatResponse> {
    const tier = params.tier ?? 'free';
    const check = defaultTwinUsageTracker.checkMessageLimit(params.userId, tier);
    if (!check.allowed) {
      return {
        reply: check.reason ?? 'Message limit reached.',
        messagesRemaining: 0,
      };
    }

    const profile = params.profile
      ? { ...this.getProfile(params.userId), ...params.profile, userId: params.userId }
      : this.getProfile(params.userId);

    const enabledCategories = canUseMemoryCategories(tier)
      ? (profile.preferences.memoryCategoriesEnabled as TwinMemoryCategory[])
      : (['business'] as TwinMemoryCategory[]);

    const todayEvents = await this.listTodayEvents(params.userId, tier);
    const memorySummary = this.memory.buildContext(params.userId, enabledCategories);
    const systemPrompt = this.personality.buildSystemPrompt({
      profile,
      memorySummary,
      todayEvents,
      enabledCategories,
    });

    const hubHistory = (params.history ?? [])
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const hubResult = await executeTwinPrompt({
      userId: params.userId,
      membershipTier: tier,
      systemPrompt,
      prompt: params.message,
      history: hubHistory,
    });

    defaultTwinUsageTracker.recordMessage(params.userId);
    const remaining = defaultTwinUsageTracker.checkMessageLimit(params.userId, tier).remaining;

    if (hubResult) {
      return {
        reply: hubResult.content,
        creditsUsed: hubResult.credits,
        modelId: hubResult.modelId,
        messagesRemaining: remaining,
        suggestedActions: this.inferActions(params.message),
      };
    }

    return {
      ...this.chatLocal(params, todayEvents, memorySummary),
      messagesRemaining: remaining,
    };
  }

  planMyDay(userId: string, tier: MembershipTier, displayName?: string): Promise<TwinChatResponse> {
    return this.chat({
      userId,
      tier,
      message: 'Plan my day based on my calendar and priorities. Give me a concise hour-by-hour schedule with focus blocks.',
      profile: displayName ? { displayName } : undefined,
    });
  }

  private chatLocal(
    params: TwinChatRequest,
    events: CalendarEvent[],
    memorySummary: string,
  ): TwinChatResponse {
    const q = params.message.toLowerCase().trim();
    const followUp = /^(why|explain|tell me more|what do you mean|how come|elaborate)[\s?!.]*$/i.test(q);
    const lastAssistant = [...(params.history ?? [])]
      .reverse()
      .find((m) => m.role === 'assistant');

    if (followUp && lastAssistant) {
      const prev = lastAssistant.content.toLowerCase();
      if (prev.includes('fraud') || prev.includes('alert')) {
        return {
          reply:
            'That alert was raised from patterns in your schedule or tasks — for example overlapping commitments, a high-priority item without prep time, or a conflict I noticed when planning your day. Ask about a specific meeting if you want details.',
          suggestedActions: ['Plan my day'],
        };
      }
      if (prev.includes('plan') || prev.includes('schedule') || prev.includes('calendar')) {
        const lines = events.map(
          (e, i) => `${i + 1}. ${e.start}–${e.end}: ${e.title}${e.location ? ` @ ${e.location}` : ''}`,
        );
        return {
          reply: `Building on my earlier answer — here's the reasoning: I ordered your day around fixed meetings first, then placed focus work in the largest open block.\n\n${lines.join('\n')}`,
          suggestedActions: ['Add focus block'],
        };
      }
      return {
        reply: `You asked for more detail about: "${lastAssistant.content.slice(0, 200)}${lastAssistant.content.length > 200 ? '…' : ''}" — could you specify what part you'd like me to expand on?`,
        suggestedActions: ['Plan my day'],
      };
    }

    if (q.includes('plan') && (q.includes('day') || q.includes('schedule'))) {
      const lines = events.map(
        (e, i) => `${i + 1}. ${e.start}–${e.end}: ${e.title}${e.location ? ` @ ${e.location}` : ''}`,
      );
      return {
        reply: [
          "Here's your day plan:",
          '',
          ...lines,
          '',
          '**Focus block:** 15:00–17:00 is open — use it for deep work on your top priority.',
          '**Tip:** Review notes 10 min before each meeting.',
        ].join('\n'),
        suggestedActions: ['Add focus block', 'Prep for product review'],
      };
    }

    if (q.includes('calendar') || q.includes('meeting')) {
      const count = events.length;
      return {
        reply: `You have ${count} event(s) today. Next up: ${events[0]?.title ?? 'none scheduled'}.`,
        suggestedActions: ['Plan my day'],
      };
    }

    if (q.includes('memory') || q.includes('remember')) {
      return {
        reply: `I remember context from your consent-gated categories:\n${memorySummary}`,
        suggestedActions: ['Update memory'],
      };
    }

    return {
      reply:
        "I'm your Digital Twin. I can plan your day, summarize meetings, and remember what matters — all with your consent. Try \"Plan my day\" or ask about your schedule.",
      suggestedActions: ['Plan my day', 'What\'s on my calendar?'],
    };
  }

  private inferActions(message: string): string[] {
    const q = message.toLowerCase();
    if (q.includes('plan')) return ['Add to calendar', 'Set reminder'];
    if (q.includes('meeting')) return ['Prep brief', 'Plan my day'];
    return ['Plan my day'];
  }
}

export const defaultDigitalTwinService = new DigitalTwinService();
