import type { MembershipFeature, MembershipTier } from '@ai-pass/shared';
import { defaultMembershipService } from '@ai-pass/membership';

export const CS_AI_FEATURES = {
  basic: 'customer_support_ai' as MembershipFeature,
  voice: 'customer_support_voice' as MembershipFeature,
  crm: 'customer_support_crm' as MembershipFeature,
  enterprise: 'customer_support_enterprise' as MembershipFeature,
} as const;

export function canAccessCustomerSupportAI(tier: MembershipTier): boolean {
  return defaultMembershipService.hasFeature(tier, CS_AI_FEATURES.basic);
}

export function canAccessVoice(tier: MembershipTier): boolean {
  return defaultMembershipService.hasFeature(tier, CS_AI_FEATURES.voice);
}

export function canAccessCrmIntegration(tier: MembershipTier): boolean {
  return defaultMembershipService.hasFeature(tier, CS_AI_FEATURES.crm);
}

export function canAccessEnterpriseSupport(tier: MembershipTier): boolean {
  return defaultMembershipService.hasFeature(tier, CS_AI_FEATURES.enterprise);
}

export function getConversationLimit(tier: MembershipTier): number {
  switch (tier) {
    case 'free': return 10;
    case 'professional': return 100;
    case 'power': return 1000;
    case 'enterprise': return Infinity;
    default: return 10;
  }
}

export function checkCSFeature(
  tier: MembershipTier,
  feature: keyof typeof CS_AI_FEATURES,
): { allowed: boolean; reason?: string } {
  const membershipFeature = CS_AI_FEATURES[feature];
  const allowed = defaultMembershipService.hasFeature(tier, membershipFeature);
  if (!allowed) {
    return { allowed: false, reason: `Customer Support ${feature} requires a higher membership plan.` };
  }
  return { allowed: true };
}
