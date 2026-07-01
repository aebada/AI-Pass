/** Universal AI Membership — cross-platform plan & entitlement types */

export type MembershipTier = 'free' | 'professional' | 'power' | 'enterprise';

export type MembershipFeature =
  | 'playground'
  | 'playground_compare'
  | 'playground_benchmark'
  | 'marketplace_browse'
  | 'marketplace_install'
  | 'prompt_lab'
  | 'agent_studio'
  | 'workflows'
  | 'analysis_studio'
  | 'knowledge_pipeline'
  | 'multi_agent'
  | 'automations'
  | 'benchmarking'
  | 'premium_models'
  | 'all_models'
  | 'private_routing'
  | 'governance'
  | 'compliance'
  | 'dedicated_support'
  | 'unlimited_connections'
  | 'invoice_ai'
  | 'invoice_ai_fraud'
  | 'invoice_ai_automation'
  | 'invoice_ai_enterprise'
  | 'customer_support_ai'
  | 'customer_support_voice'
  | 'customer_support_crm'
  | 'customer_support_enterprise'
  | 'supply_chain_ai'
  | 'supply_chain_ai_advanced'
  | 'supply_chain_ai_erp'
  | 'supply_chain_ai_enterprise'
  | 'presence_audit'
  | 'presence_audit_monitoring'
  | 'presence_audit_api'
  | 'presence_audit_enterprise'
  | 'compliance_ai'
  | 'compliance_ai_trust_center'
  | 'compliance_ai_copilot'
  | 'compliance_ai_enterprise'
  | 'sales_ai'
  | 'sales_ai_crm'
  | 'sales_ai_campaigns'
  | 'sales_ai_enterprise'
  | 'content_ai'
  | 'content_ai_humanize'
  | 'content_ai_batch'
  | 'content_ai_api'
  | 'content_ai_enterprise';

export interface MembershipEntitlements {
  tier: MembershipTier;
  dailyRequestLimit: number | null;
  monthlyCredits: number;
  maxAgents: number | null;
  maxWorkflows: number | null;
  allowedModelTiers: ('free' | 'standard' | 'premium' | 'frontier')[];
  features: MembershipFeature[];
}

export interface MembershipPlan {
  id: MembershipTier;
  name: string;
  tagline: string;
  priceMonthly: number | null;
  priceLabel: string;
  entitlements: MembershipEntitlements;
  highlights: string[];
}

export interface MembershipUsage {
  userId: string;
  tier: MembershipTier;
  requestsToday: number;
  creditsUsedThisMonth: number;
  creditsRemaining: number;
}

export interface OrgMembershipPolicy {
  orgId: string;
  defaultTier: MembershipTier;
  allowedProviders: string[];
  blockedModels: string[];
  monthlyBudgetUsd: number | null;
  perUserDailyLimit: number | null;
  requireApprovalAboveUsd: number | null;
}
