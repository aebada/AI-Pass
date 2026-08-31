import type { MembershipFeature, MembershipTier } from '@ai-pass/shared';
import { defaultMembershipService } from '@ai-pass/membership';

export const INVOICE_AI_FEATURES = {
  basic: 'invoice_ai' as MembershipFeature,
  fraud: 'invoice_ai_fraud' as MembershipFeature,
  automation: 'invoice_ai_automation' as MembershipFeature,
  enterprise: 'invoice_ai_enterprise' as MembershipFeature,
} as const;

export function canAccessInvoiceAI(tier: MembershipTier): boolean {
  return defaultMembershipService.hasFeature(tier, INVOICE_AI_FEATURES.basic);
}

export function canAccessFraudCenter(tier: MembershipTier): boolean {
  return defaultMembershipService.hasFeature(tier, INVOICE_AI_FEATURES.fraud);
}

export function canAccessWorkflowBuilder(tier: MembershipTier): boolean {
  return defaultMembershipService.hasFeature(tier, INVOICE_AI_FEATURES.automation);
}

export function canAccessEnterprisePacks(tier: MembershipTier): boolean {
  return defaultMembershipService.hasFeature(tier, INVOICE_AI_FEATURES.enterprise);
}

export function checkInvoiceAIFeature(
  tier: MembershipTier,
  feature: keyof typeof INVOICE_AI_FEATURES,
): { allowed: boolean; reason?: string } {
  const membershipFeature = INVOICE_AI_FEATURES[feature];
  const allowed = defaultMembershipService.hasFeature(tier, membershipFeature);
  if (!allowed) {
    return {
      allowed: false,
      reason: `Invoice AI ${feature} requires a higher membership plan.`,
    };
  }
  return { allowed: true };
}
