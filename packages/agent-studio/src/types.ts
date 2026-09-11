import type {
  AgentDecision,
  ExecutionStatus,
  RiskLevel,
  SkillAvailability,
  StudioAgent,
  StudioAgentStatus,
  WorkflowConfig,
  WorkflowStepDef,
} from '@ai-pass/shared';
import type { Execution as RuntimeExecution, Plan, PlanInput } from '@ai-pass/runtime-core';

/** Agent domain / purpose types */
export type AgentType =
  | 'Decision'
  | 'Document'
  | 'Analysis'
  | 'Workflow'
  | 'Automation'
  | 'Customer Support'
  | 'Finance'
  | 'Procurement'
  | 'Compliance'
  | 'Research'
  | 'Sales'
  | 'Custom';

/** Skill capability types */
export type SkillType =
  | 'OCR'
  | 'Retrieval'
  | 'Decision'
  | 'Summarization'
  | 'Translation'
  | 'Compliance'
  | 'Knowledge'
  | 'Automation'
  | 'Notification'
  | 'Analytics'
  | 'Voice'
  | 'Vision'
  | 'Computer Action'
  | 'API'
  | 'Custom';

export interface Agent extends StudioAgent {
  agentType: AgentType;
  skillIds: string[];
  workflowId?: string;
  modelId?: string;
  publishedVersion?: number;
  marketplaceListingId?: string;
  trustScore?: number;
  sharedWith?: string[];
  tenantId?: string;
}

export interface AgentVersion {
  agentId: string;
  versionNumber: number;
  workflowConfig: WorkflowConfig;
  changelog?: string;
  publishedAt?: string;
  createdAt: string;
}

export interface Skill {
  id: string;
  name: string;
  slug: string;
  skillType: SkillType;
  category: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  creditCost: number;
  /** Runtime capability scopes (e.g. documents.read) — not workspace ACLs. */
  permissions: string[];
  riskLevel: RiskLevel;
  version: string;
  marketplaceSkillId?: string;
  certified?: boolean;
  /**
   * Workspace visibility / discoverability.
   * Defaults to all_members for migrated skills.
   */
  availability: SkillAvailability;
  /** User IDs who may edit this skill (and see it when editors_only). */
  editorIds: string[];
  createdBy?: string;
  workspaceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SkillVersion {
  id: string;
  skillId: string;
  version: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  creditCost: number;
  changelog?: string;
  publishedAt: string;
}

export type WorkflowStepType =
  | 'skill'
  | 'condition'
  | 'loop'
  | 'parallel'
  | 'delay'
  | 'approval'
  | 'retry'
  | 'action';

export interface WorkflowStep extends Omit<WorkflowStepDef, 'type'> {
  type: WorkflowStepType;
  label?: string;
  retryCount?: number;
  delayMs?: number;
  approvalRole?: string;
  onError?: 'fail' | 'retry' | 'skip' | 'fallback';
  fallbackStepId?: string;
}

export interface Workflow {
  id: string;
  agentId: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  templateId?: string;
  automationWorkflowId?: string;
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionLog {
  id: string;
  executionId: string;
  stepId?: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface Execution {
  id: string;
  agentId: string;
  agentName?: string;
  input: Record<string, unknown>;
  output?: {
    decision: AgentDecision;
    confidence: number;
    evidence: string[];
    reasons: string[];
    structured?: Record<string, unknown>;
  };
  steps: ExecutionStepRecord[];
  logs: ExecutionLog[];
  status: ExecutionStatus;
  creditsUsed: number;
  latencyMs?: number;
  runtimeExecutionId?: string;
  planId?: string;
  startedAt: string;
  completedAt?: string;
}

export interface ExecutionStepRecord {
  stepId: string;
  skillId?: string;
  name?: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  durationMs: number;
  status: ExecutionStatus;
}

export interface PlannerRequest {
  agentId: string;
  goal: string;
  context?: Record<string, unknown>;
  constraints?: PlanInput['constraints'];
}

export interface PlannerResult {
  plan: Plan;
  agentId: string;
}

export interface EvaluationRequest {
  executionId: string;
  goal: string;
  result: Record<string, unknown>;
}

export interface Evaluation {
  executionId: string;
  passed: boolean;
  confidence: number;
  decision: AgentDecision;
  issues: string[];
  evidence: string[];
}

export interface AgentMetrics {
  agentId: string;
  executionCount: number;
  successRate: number;
  avgConfidence: number;
  avgLatencyMs: number;
  creditsUsed: number;
  failureCount: number;
  lastExecutedAt?: string;
}

export interface StudioMonitoringSnapshot {
  executionCount: number;
  runningCount: number;
  failureRate: number;
  avgConfidence: number;
  avgLatencyMs: number;
  creditsConsumed: number;
  providerUsage: Record<string, number>;
  skillUsage: Record<string, number>;
  health: 'healthy' | 'degraded' | 'critical';
}

export interface AnalyticsSummary {
  period: string;
  totalExecutions: number;
  uniqueAgents: number;
  creditsUsed: number;
  topAgents: Array<{ agentId: string; name: string; count: number }>;
  topSkills: Array<{ skillId: string; name: string; count: number }>;
  successRate: number;
}

export interface PublishRequest {
  agentId: string;
  versionNumber?: number;
  pricingModel?: 'free' | 'subscription' | 'pay_per_use';
  priceMonthly?: number;
  pricePerUse?: number;
}

export interface PublishResult {
  listingId: string;
  agentId: string;
  version: number;
  status: 'published' | 'pending_review';
  marketplaceUrl?: string;
}

export type OrchestratorRole = 'coordinator' | 'planner' | 'evaluator' | 'supervisor' | 'worker';

export interface MultiAgentChain {
  id: string;
  name: string;
  agents: Array<{ agentId: string; role: OrchestratorRole; order: number }>;
  mergeStrategy: 'sequential' | 'vote' | 'supervisor';
}

export interface MultiAgentResult {
  chainId: string;
  outputs: Record<string, Execution>;
  merged: Execution['output'];
  creditsUsed: number;
}

export interface ExecuteAgentRequest {
  agentId: string;
  input: Record<string, unknown>;
  tenantId?: string;
  userId?: string;
  membershipTier?: PlanInput['membershipTier'];
  skipGovernance?: boolean;
}

export interface ExecuteAgentResponse {
  execution: Execution;
  runtime?: RuntimeExecution;
  governance?: { allowed: boolean; violations: string[] };
  trustScore?: number;
}

export type CreateAgentInput = Omit<
  Agent,
  'id' | 'createdAt' | 'updatedAt' | 'currentVersion' | 'agentType'
> & { agentType?: AgentType };

export { StudioAgentStatus, WorkflowConfig, WorkflowStepDef };
