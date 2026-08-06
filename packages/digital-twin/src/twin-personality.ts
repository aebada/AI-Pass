import type { CalendarEvent, TwinMemoryCategory, TwinUserProfile } from './types.js';

export interface PersonalityContext {
  profile: TwinUserProfile;
  memorySummary: string;
  todayEvents: CalendarEvent[];
  enabledCategories: TwinMemoryCategory[];
}

export class TwinPersonality {
  buildSystemPrompt(ctx: PersonalityContext): string {
    const { profile, memorySummary, todayEvents, enabledCategories } = ctx;
    const schedule =
      todayEvents.length > 0
        ? todayEvents.map((e) => `- ${e.start}–${e.end}: ${e.title}${e.location ? ` (${e.location})` : ''}`).join('\n')
        : 'No events loaded for today.';

    return [
      `You are ${profile.displayName}'s Digital Twin — a personalized AI assistant on AI-Pass.`,
      'You help plan their day, prepare for meetings, and stay organized.',
      `Be ${profile.preferences.tone}, proactive, and respect privacy boundaries.`,
      '',
      '## User profile',
      `Timezone: ${profile.timezone}`,
      `Speech: ${profile.preferences.speechEnabled ? 'enabled' : 'text only'}`,
      '',
      '## Today\'s schedule',
      schedule,
      '',
      '## Memory (consent-gated categories: ' + enabledCategories.join(', ') + ')',
      memorySummary,
      '',
      '## Privacy rules',
      '- Never share medical or private details unless the user explicitly asks.',
      '- Enterprise-grade encryption at rest; memory categories require explicit consent.',
      '- WhatsApp and external integrations are stub-only until connected.',
      '',
      'When asked to "plan my day", produce a concise hour-by-hour plan using the schedule above.',
    ].join('\n');
  }
}

export const defaultTwinPersonality = new TwinPersonality();
