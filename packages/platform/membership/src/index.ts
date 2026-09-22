export { MEMBERSHIP_PLANS, MEMBERSHIP_FEATURE_MATRIX, getPlan, FREE_TIER_MODEL_IDS, POWER_ONLY_MODEL_IDS, POWER_ONLY_PROVIDER_IDS } from './plans.js';
export {
  MembershipService,
  defaultMembershipService,
  type MembershipCheckResult,
} from './membership-service.js';
export function planToProGateTier(tier: string): 'free' | 'pro' | 'enterprise' {
  if (tier === 'enterprise') return 'enterprise';
  if (tier === 'free') return 'free';
  return 'pro';
}

export function planToTierLabel(tier: string): string {
  const labels: Record<string, string> = {
    free: 'Free',
    professional: 'Professional',
    power: 'Power',
    enterprise: 'Enterprise',
  };
  return labels[tier] ?? tier;
}
