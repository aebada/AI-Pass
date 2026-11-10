/** Cross-platform primitives shared across AI-Pass modules */

export type AgentDecision = 'PASS' | 'FAIL' | 'NEEDS_INFO';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type CertificationLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

export type CertificationStatus =
  | 'draft'
  | 'submitted'
  | 'queued'
  | 'running'
  | 'certified'
  | 'conditionally_certified'
  | 'not_certified'
  | 'expired'
  | 'revoked'
  | 'under_review';

export type AppType =
  | 'hosted_saas'
  | 'github'
  | 'external_link'
  | 'automation_pack'
  | 'agent_pack'
  | 'skill_pack';

export type PricingModel =
  | 'free'
  | 'subscription'
  | 'pay_per_use'
  | 'enterprise_license'
  | 'freemium';

export type SkillCategory =
  | 'data'
  | 'decision'
  | 'reasoning'
  | 'automation'
  | 'voice'
  | 'governance'
  | 'computer_action';

export type StudioAgentStatus = 'draft' | 'active' | 'archived' | 'suspended';

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface StructuredOutput {
  decision: AgentDecision;
  reasons: string[];
  evidence: string[];
  confidence: number;
  metadata?: Record<string, unknown>;
}

export interface CreditUsage {
  userId: string;
  tenantId?: string;
  requestType: string;
  creditsUsed: number;
  timestamp: string;
}

export interface AuditEntry {
  id: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface TenantContext {
  tenantId: string;
  userId: string;
  plan: string;
  roles: string[];
}
