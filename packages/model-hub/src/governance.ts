import type { GovernancePolicy, ModelCategory, ModelPricingTier } from './types.js';

export const DEFAULT_GOVERNANCE_POLICIES: GovernancePolicy[] = [
  {
    id: 'org-default',
    name: 'Organization Default',
    description: 'Standard policy — all managed models allowed, frontier requires approval',
    allowedCategories: ['aipass', 'provider', 'open-source', 'private'],
    blockedModelIds: [],
    requireApproval: false,
    maxTier: 'frontier',
  },
  {
    id: 'eu-compliance',
    name: 'EU Data Residency',
    description: 'Restrict to EU-friendly providers and AI-Pass models',
    allowedCategories: ['aipass', 'provider', 'private'],
    blockedModelIds: ['grok-2'],
    requireApproval: true,
    maxTier: 'premium',
  },
  {
    id: 'air-gapped',
    name: 'Air-Gapped / On-Prem',
    description: 'Only local and customer private endpoints',
    allowedCategories: ['open-source', 'private', 'aipass'],
    blockedModelIds: [],
    allowedModelIds: undefined,
    requireApproval: false,
    maxTier: 'premium',
  },
  {
    id: 'free-tier',
    name: 'Free Tier Sandbox',
    description: 'Free and standard models only for development',
    allowedCategories: ['aipass', 'provider', 'open-source'],
    blockedModelIds: ['claude-opus-4', 'gpt-5', 'o3-mini'],
    requireApproval: false,
    maxTier: 'standard',
  },
];

const TIER_RANK: Record<ModelPricingTier, number> = {
  free: 0,
  standard: 1,
  premium: 2,
  frontier: 3,
};

export function isModelAllowedByPolicy(
  modelId: string,
  category: ModelCategory,
  tier: ModelPricingTier,
  policy: GovernancePolicy,
): boolean {
  if (policy.blockedModelIds.includes(modelId)) return false;
  if (policy.allowedModelIds?.length && !policy.allowedModelIds.includes(modelId)) {
    return false;
  }
  if (!policy.allowedCategories.includes(category)) return false;
  return TIER_RANK[tier] <= TIER_RANK[policy.maxTier];
}

export function getGovernancePolicy(id: string): GovernancePolicy | undefined {
  return DEFAULT_GOVERNANCE_POLICIES.find((p) => p.id === id);
}
