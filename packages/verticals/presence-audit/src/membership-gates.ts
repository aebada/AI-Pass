import type { MembershipTier } from '@ai-pass/shared';
import { defaultMembershipService } from '@ai-pass/membership';

export const PRESENCE_FEATURES = {
  basic: 'presence_audit' as const,
  monitoring: 'presence_audit_monitoring' as const,
  api: 'presence_audit_api' as const,
  enterprise: 'presence_audit_enterprise' as const,
};

export interface PresenceLimits {
  auditsPerMonth: number;
  maxProviders: number;
  maxCompetitors: number;
  monitoringSchedules: boolean;
  apiAccess: boolean;
  customPrompts: number;
}

const TIER_LIMITS: Record<MembershipTier, PresenceLimits> = {
  free: {
    auditsPerMonth: 2,
    maxProviders: 1,
    maxCompetitors: 1,
    monitoringSchedules: false,
    apiAccess: false,
    customPrompts: 3,
  },
  professional: {
    auditsPerMonth: 10,
    maxProviders: 2,
    maxCompetitors: 3,
    monitoringSchedules: false,
    apiAccess: false,
    customPrompts: 10,
  },
  power: {
    auditsPerMonth: 50,
    maxProviders: 4,
    maxCompetitors: 10,
    monitoringSchedules: true,
    apiAccess: true,
    customPrompts: 50,
  },
  enterprise: {
    auditsPerMonth: Infinity,
    maxProviders: 4,
    maxCompetitors: Infinity,
    monitoringSchedules: true,
    apiAccess: true,
    customPrompts: Infinity,
  },
};

export function getPresenceLimits(tier: MembershipTier): PresenceLimits {
  return TIER_LIMITS[tier];
}

export function canAccessPresenceAudit(tier: MembershipTier): boolean {
  return defaultMembershipService.hasFeature(tier, PRESENCE_FEATURES.basic);
}

export function canAccessMonitoring(tier: MembershipTier): boolean {
  return defaultMembershipService.hasFeature(tier, PRESENCE_FEATURES.monitoring)
    || getPresenceLimits(tier).monitoringSchedules;
}

export function checkPresenceFeature(
  tier: MembershipTier,
  feature: keyof typeof PRESENCE_FEATURES,
): { allowed: boolean; reason?: string } {
  const limits = getPresenceLimits(tier);
  if (feature === 'monitoring' && !limits.monitoringSchedules) {
    return { allowed: false, reason: 'Monitoring schedules require Growth or Enterprise plan.' };
  }
  if (feature === 'api' && !limits.apiAccess) {
    return { allowed: false, reason: 'API access requires Growth or Enterprise plan.' };
  }
  return { allowed: true };
}
