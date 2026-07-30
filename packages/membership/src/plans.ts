import type {
  MembershipEntitlements,
  MembershipFeature,
  MembershipPlan,
  MembershipTier,
} from '@ai-pass/shared';

/** Model IDs available on the free tier */
export const FREE_TIER_MODEL_IDS = [
  'gpt-4o-mini',
  'gemini-flash',
  'deepseek-free',
  'deepseek-r1-free',
  'llama-3.3-70b',
  'openrouter-free',
  'gpt-oss-20b-free',
] as const;

/** Providers / models that require Power tier or above */
export const POWER_ONLY_PROVIDER_IDS = ['grok', 'cerebras', 'sambanova'] as const;

export const POWER_ONLY_MODEL_IDS = ['gpt-5', 'claude-opus-4', 'o3-mini', 'grok-2'] as const;

const FREE_FEATURES: MembershipFeature[] = [
  'playground',
  'marketplace_browse',
  'content_ai',
];

const PRO_FEATURES: MembershipFeature[] = [
  ...FREE_FEATURES,
  'playground_compare',
  'marketplace_install',
  'prompt_lab',
  'agent_studio',
  'workflows',
  'premium_models',
  'invoice_ai',
  'customer_support_ai',
  'supply_chain_ai',
  'compliance_ai',
  'sales_ai',
  'content_ai_humanize',
];

const POWER_FEATURES: MembershipFeature[] = [
  ...PRO_FEATURES,
  'playground_benchmark',
  'analysis_studio',
  'knowledge_pipeline',
  'multi_agent',
  'automations',
  'benchmarking',
  'all_models',
  'invoice_ai_fraud',
  'invoice_ai_automation',
  'customer_support_voice',
  'customer_support_crm',
  'supply_chain_ai_advanced',
  'compliance_ai_trust_center',
  'compliance_ai_copilot',
  'sales_ai_crm',
  'sales_ai_campaigns',
  'content_ai_batch',
];

const ENTERPRISE_FEATURES: MembershipFeature[] = [
  ...POWER_FEATURES,
  'private_routing',
  'governance',
  'compliance',
  'dedicated_support',
  'unlimited_connections',
  'invoice_ai_enterprise',
  'customer_support_enterprise',
  'supply_chain_ai_erp',
  'supply_chain_ai_enterprise',
  'compliance_ai_enterprise',
  'sales_ai_enterprise',
  'content_ai_api',
  'content_ai_enterprise',
];

function entitlements(
  tier: MembershipTier,
  dailyRequestLimit: number | null,
  monthlyCredits: number,
  maxAgents: number | null,
  maxWorkflows: number | null,
  allowedModelTiers: MembershipEntitlements['allowedModelTiers'],
  features: MembershipFeature[],
): MembershipEntitlements {
  return {
    tier,
    dailyRequestLimit,
    monthlyCredits,
    maxAgents,
    maxWorkflows,
    allowedModelTiers,
    features,
  };
}

/** Universal Membership plan matrix */
export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Explore AI Pass with open models',
    priceMonthly: 0,
    priceLabel: '$0',
    entitlements: entitlements('free', 20, 500, 1, 1, ['free', 'standard'], FREE_FEATURES),
    highlights: [
      '20 requests/day',
      '500 monthly credits',
      'GPT-4o Mini, Gemini Flash, Llama 3.3, OpenRouter Free',
      'Browse Marketplace',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    tagline: 'Premium models for teams shipping solutions',
    priceMonthly: 49,
    priceLabel: '$49/mo',
    entitlements: entitlements('professional', 500, 5000, 10, 10, ['free', 'standard', 'premium'], PRO_FEATURES),
    highlights: [
      'Premium models (GPT-4, Claude Sonnet, Gemini Pro)',
      'Prompt Lab & Agent Studio',
      'Workflows & Marketplace',
      '5,000 monthly credits',
    ],
  },
  {
    id: 'power',
    name: 'Power',
    tagline: 'All models, multi-agent, and automations',
    priceMonthly: 149,
    priceLabel: '$149/mo',
    entitlements: entitlements('power', null, 25000, null, null, ['free', 'standard', 'premium', 'frontier'], POWER_FEATURES),
    highlights: [
      'All models including Grok, Cerebras, SambaNova',
      'Multi-agent & automations',
      'Benchmarking & Analysis Studio',
      'Knowledge Pipeline',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Governance, compliance, and private routing',
    priceMonthly: null,
    priceLabel: 'Custom',
    entitlements: entitlements('enterprise', null, 100000, null, null, ['free', 'standard', 'premium', 'frontier'], ENTERPRISE_FEATURES),
    highlights: [
      'Unlimited connections',
      'Private routing & BYOK hybrid',
      'Governance & compliance',
      'Dedicated support & SLA',
    ],
  },
];

export function getPlan(tier: MembershipTier): MembershipPlan {
  const plan = MEMBERSHIP_PLANS.find((p) => p.id === tier);
  if (!plan) throw new Error(`Unknown membership tier: ${tier}`);
  return plan;
}

export const MEMBERSHIP_FEATURE_MATRIX: Record<MembershipFeature, Record<MembershipTier, boolean>> =
  buildFeatureMatrix();

function buildFeatureMatrix(): Record<MembershipFeature, Record<MembershipTier, boolean>> {
  const tiers: MembershipTier[] = ['free', 'professional', 'power', 'enterprise'];
  const allFeatures = new Set<MembershipFeature>();
  for (const plan of MEMBERSHIP_PLANS) {
    for (const f of plan.entitlements.features) allFeatures.add(f);
  }

  const matrix = {} as Record<MembershipFeature, Record<MembershipTier, boolean>>;
  for (const feature of allFeatures) {
    matrix[feature] = { free: false, professional: false, power: false, enterprise: false };
    for (const tier of tiers) {
      const plan = getPlan(tier);
      matrix[feature][tier] = plan.entitlements.features.includes(feature);
    }
  }
  return matrix;
}
