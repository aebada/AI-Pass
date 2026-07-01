import type { MembershipTier, MembershipFeature } from '@ai-pass/shared';
import { defaultMembershipService } from '@ai-pass/membership';

/** Plan mapping: Free / Starter / Growth / Business / Enterprise → platform tiers */
export type ComplianceFeature = 'basic' | 'trustCenter' | 'copilot' | 'enterprise';

export const COMPLIANCE_AI_FEATURES: Record<ComplianceFeature, MembershipFeature> = {
  basic: 'compliance_ai',
  trustCenter: 'compliance_ai_trust_center',
  copilot: 'compliance_ai_copilot',
  enterprise: 'compliance_ai_enterprise',
};

export function canAccessComplianceAI(tier: MembershipTier): boolean {
  return (
    defaultMembershipService.hasFeature(tier, COMPLIANCE_AI_FEATURES.basic) ||
    defaultMembershipService.hasFeature(tier, 'compliance')
  );
}

export function canAccessTrustCenter(tier: MembershipTier): boolean {
  return defaultMembershipService.hasFeature(tier, COMPLIANCE_AI_FEATURES.trustCenter);
}

export function canAccessCopilot(tier: MembershipTier): boolean {
  return defaultMembershipService.hasFeature(tier, COMPLIANCE_AI_FEATURES.copilot);
}

export function canAccessEnterpriseCompliance(tier: MembershipTier): boolean {
  return defaultMembershipService.hasFeature(tier, COMPLIANCE_AI_FEATURES.enterprise);
}

export function getFrameworkLimit(tier: MembershipTier): number {
  switch (tier) {
    case 'free': return 0;
    case 'professional': return 3;
    case 'power': return 7;
    case 'enterprise': return Infinity;
    default: return 0;
  }
}

export function checkComplianceFeature(
  tier: MembershipTier,
  feature: ComplianceFeature,
): { allowed: boolean; reason?: string } {
  const map: Record<ComplianceFeature, () => boolean> = {
    basic: () => canAccessComplianceAI(tier),
    trustCenter: () => canAccessTrustCenter(tier),
    copilot: () => canAccessCopilot(tier),
    enterprise: () => canAccessEnterpriseCompliance(tier),
  };
  const allowed = map[feature]();
  if (!allowed) {
    return { allowed: false, reason: `Compliance AI ${feature} requires a higher membership plan.` };
  }
  return { allowed: true };
}
