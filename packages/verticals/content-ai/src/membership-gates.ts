import type { MembershipTier } from '@ai-pass/shared';
import { defaultMembershipService } from '@ai-pass/membership';

export const CONTENT_AI_FEATURES = {
  basic: 'content_ai' as const,
  humanize: 'content_ai_humanize' as const,
  batch: 'content_ai_batch' as const,
  api: 'content_ai_api' as const,
  enterprise: 'content_ai_enterprise' as const,
};

export interface ContentLimits {
  detectsPerMonth: number;
  humanizesPerMonth: number;
  batchAccess: boolean;
  apiAccess: boolean;
}

const TIER_LIMITS: Record<MembershipTier, ContentLimits> = {
  free: {
    detectsPerMonth: 3,
    humanizesPerMonth: 0,
    batchAccess: false,
    apiAccess: false,
  },
  professional: {
    detectsPerMonth: 50,
    humanizesPerMonth: 20,
    batchAccess: false,
    apiAccess: false,
  },
  power: {
    detectsPerMonth: Infinity,
    humanizesPerMonth: 200,
    batchAccess: true,
    apiAccess: false,
  },
  enterprise: {
    detectsPerMonth: Infinity,
    humanizesPerMonth: Infinity,
    batchAccess: true,
    apiAccess: true,
  },
};

export function getContentLimits(tier: MembershipTier): ContentLimits {
  return TIER_LIMITS[tier];
}

export function canAccessContentAI(tier: MembershipTier): boolean {
  return defaultMembershipService.hasFeature(tier, CONTENT_AI_FEATURES.basic);
}

export function canHumanize(tier: MembershipTier): boolean {
  return getContentLimits(tier).humanizesPerMonth > 0;
}

export function canAccessBatch(tier: MembershipTier): boolean {
  return getContentLimits(tier).batchAccess;
}

export function canAccessApi(tier: MembershipTier): boolean {
  return getContentLimits(tier).apiAccess;
}

export function checkContentFeature(
  tier: MembershipTier,
  feature: keyof typeof CONTENT_AI_FEATURES,
): { allowed: boolean; reason?: string } {
  const limits = getContentLimits(tier);
  if (feature === 'humanize' && limits.humanizesPerMonth === 0) {
    return { allowed: false, reason: 'Humanization requires Professional membership or higher.' };
  }
  if (feature === 'batch' && !limits.batchAccess) {
    return { allowed: false, reason: 'Batch processing requires Power or Enterprise plan.' };
  }
  if (feature === 'api' && !limits.apiAccess) {
    return { allowed: false, reason: 'API access requires Enterprise plan.' };
  }
  return { allowed: true };
}
