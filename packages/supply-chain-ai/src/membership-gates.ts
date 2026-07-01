import type { MembershipFeature, MembershipTier } from '@ai-pass/shared';
import { defaultMembershipService } from '@ai-pass/membership';

export const SUPPLY_CHAIN_FEATURES = {
  basic: 'supply_chain_ai' as MembershipFeature,
  advanced: 'supply_chain_ai_advanced' as MembershipFeature,
  erp: 'supply_chain_ai_erp' as MembershipFeature,
  enterprise: 'supply_chain_ai_enterprise' as MembershipFeature,
} as const;

export function canAccessSupplyChainAI(tier: MembershipTier): boolean {
  return defaultMembershipService.hasFeature(tier, SUPPLY_CHAIN_FEATURES.basic);
}

export function canAccessAdvancedScoring(tier: MembershipTier): boolean {
  return defaultMembershipService.hasFeature(tier, SUPPLY_CHAIN_FEATURES.advanced);
}

export function canAccessErpSync(tier: MembershipTier): boolean {
  return defaultMembershipService.hasFeature(tier, SUPPLY_CHAIN_FEATURES.erp);
}

export function canAccessEnterpriseProcurement(tier: MembershipTier): boolean {
  return defaultMembershipService.hasFeature(tier, SUPPLY_CHAIN_FEATURES.enterprise);
}
