import type { MembershipFeature, MembershipTier } from '@ai-pass/shared';
import { defaultMembershipService } from '@ai-pass/membership';

export const SALES_AI_FEATURES = {
  basic: 'sales_ai' as MembershipFeature,
  crm: 'sales_ai_crm' as MembershipFeature,
  campaigns: 'sales_ai_campaigns' as MembershipFeature,
  enterprise: 'sales_ai_enterprise' as MembershipFeature,
} as const;

export function canAccessSalesAI(tier: MembershipTier): boolean {
  return defaultMembershipService.hasFeature(tier, SALES_AI_FEATURES.basic);
}

export function canAccessCrmIntegration(tier: MembershipTier): boolean {
  return defaultMembershipService.hasFeature(tier, SALES_AI_FEATURES.crm);
}

export function canAccessCampaigns(tier: MembershipTier): boolean {
  return defaultMembershipService.hasFeature(tier, SALES_AI_FEATURES.campaigns);
}

export function canAccessEnterpriseSales(tier: MembershipTier): boolean {
  return defaultMembershipService.hasFeature(tier, SALES_AI_FEATURES.enterprise);
}

/** Free: 20 emails/mo; Pro: 500; Business: 5000; Enterprise: unlimited */
export function getEmailLimit(tier: MembershipTier): number {
  switch (tier) {
    case 'free': return 20;
    case 'professional': return 500;
    case 'power': return 5000;
    case 'enterprise': return Infinity;
    default: return 20;
  }
}

export function checkSalesFeature(
  tier: MembershipTier,
  feature: keyof typeof SALES_AI_FEATURES,
): { allowed: boolean; reason?: string } {
  const membershipFeature = SALES_AI_FEATURES[feature];
  const allowed = defaultMembershipService.hasFeature(tier, membershipFeature);
  if (!allowed) {
    return { allowed: false, reason: `Sales AI ${feature} requires a higher membership plan.` };
  }
  return { allowed: true };
}
