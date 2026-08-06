import type { MembershipFeature, MembershipTier } from '@ai-pass/shared';
import { defaultMembershipService } from '@ai-pass/membership';
import { getTwinLimits } from './twin-limits.js';
import type { TwinUsage } from './types.js';

export const TWIN_FEATURES = {
  basic: 'digital_twin' as MembershipFeature,
  speech: 'digital_twin_speech' as MembershipFeature,
  calendar: 'digital_twin_calendar' as MembershipFeature,
  memory: 'digital_twin_memory' as MembershipFeature,
  integrations: 'digital_twin_integrations' as MembershipFeature,
  enterprise: 'digital_twin_enterprise' as MembershipFeature,
} as const;

export function canUseDigitalTwin(tier: MembershipTier): boolean {
  return defaultMembershipService.hasFeature(tier, TWIN_FEATURES.basic);
}

export function canUseTwinSpeech(tier: MembershipTier): boolean {
  return getTwinLimits(tier).speech;
}

export function canSyncCalendar(tier: MembershipTier): boolean {
  return getTwinLimits(tier).calendarSync;
}

export function canUseMemoryCategories(tier: MembershipTier): boolean {
  return getTwinLimits(tier).memoryCategories;
}

export class TwinUsageTracker {
  private usage = new Map<string, TwinUsage>();

  getUsage(userId: string): TwinUsage {
    const existing = this.usage.get(userId);
    if (existing) return existing;
    const now = new Date();
    const usage: TwinUsage = {
      userId,
      messagesThisMonth: 0,
      periodStart: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    };
    this.usage.set(userId, usage);
    return usage;
  }

  checkMessageLimit(userId: string, tier: MembershipTier): { allowed: boolean; remaining: number | null; reason?: string } {
    const limits = getTwinLimits(tier);
    if (limits.monthlyMessages === null) {
      return { allowed: true, remaining: null };
    }
    const usage = this.getUsage(userId);
    const remaining = limits.monthlyMessages - usage.messagesThisMonth;
    if (remaining <= 0) {
      return {
        allowed: false,
        remaining: 0,
        reason: `Monthly limit of ${limits.monthlyMessages} twin messages reached. Upgrade for more.`,
      };
    }
    return { allowed: true, remaining };
  }

  recordMessage(userId: string): void {
    const usage = this.getUsage(userId);
    usage.messagesThisMonth += 1;
    this.usage.set(userId, usage);
  }
}

export const defaultTwinUsageTracker = new TwinUsageTracker();
