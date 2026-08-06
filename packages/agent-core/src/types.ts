import type { MembershipTier, RiskLevel } from '@ai-pass/shared';
import type { ExecutionStatus, Plan, PlanInput } from '@ai-pass/runtime-core';

/** Agent lifecycle phases aligned with runtime-core execution */
export type AgentLifecyclePhase =
  | 'initializing'
  | 'planning'
  | 'reasoning'
  | 'executing'
  | 'validating'
  | 'evaluating'
  | 'completing'
  | 'rolling_back'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface AgentLifecycle {
  phase: AgentLifecyclePhase;
  status: ExecutionStatus;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  error?: string;
}

/** Domain classification for GenericAgent and vertical agents */
export type AgentDomain =
  | 'generic'
  | 'invoice'
  | 'hr'
  | 'supply-chain'
  | 'compliance'
  | 'customer-support'
  | 'sales'
  | 'finance'
  | 'procurement'
  | 'research'
  | 'custom';

export type AgentDeploymentStatus = 'draft' | 'active' | 'archived' | 'deprecated';

/** Model routing and provider preferences */
export interface AgentModelConfig {
  primaryModelId: string;
  fallbackModelIds?: string[];
  temperature?: number;
  maxTokens?: number;
  preferQuality?: boolean;
  preferCost?: boolean;
  membershipTier?: MembershipTier;
}

/** MCP server bindings for an agent */
export interface AgentMcpConfig {
  serverIds: string[];
  allowedTools?: string[];
  deniedTools?: string[];
  timeoutMs?: number;
}

/** Skill references and capability bindings */
export interface AgentSkillBinding {
  skillId: string;
  version?: string;
  required?: boolean;
  config?: Record<string, unknown>;
}

/** Content moderation and safety guardrails */
export interface AgentModerationConfig {
  enabled: boolean;
  blockOnViolation?: boolean;
  categories?: string[];
  maxRiskLevel?: RiskLevel;
  requireHumanReviewAbove?: RiskLevel;
}

/** Short- and long-term memory settings */
export interface AgentMemoryConfig {
  enabled: boolean;
  sessionTtlMs?: number;
  maxContextItems?: number;
  knowledgeBaseIds?: string[];
  persistAcrossRuns?: boolean;
}

/** Routing rules for plan → tool → provider selection */
export interface AgentRoutingRule {
  id: string;
  name: string;
  condition: string;
  target: 'model' | 'skill' | 'workflow' | 'tool' | 'remote';
  targetId: string;
  priority: number;
  enabled: boolean;
}

/** Permission scopes granted to the agent at runtime */
export interface AgentPermissions {
  scopes: string[];
  deniedScopes?: string[];
  requireApprovalFor?: string[];
  tenantId?: string;
}

/** Tool allowlist for agent execution */
export interface AgentToolConfig {
  toolIds: string[];
  autoApprove?: string[];
  maxConcurrent?: number;
}

/** Immutable version snapshot stored in config history */
export interface AgentConfigVersion {
  version: number;
  config: Omit<AgentConfig, 'versionHistory'>;
  changelog?: string;
  createdAt: string;
  createdBy?: string;
}

/**
 * Centralized agent configuration — canonical schema for the Agent Configuration Repository.
 * Maps to Agent Studio wizard fields plus enterprise controls.
 */
export interface AgentConfig {
  id: string;
  name: string;
  slug: string;
  description: string;
  domain: AgentDomain;
  status: AgentDeploymentStatus;
  model: AgentModelConfig;
  mcp: AgentMcpConfig;
  skills: AgentSkillBinding[];
  moderation: AgentModerationConfig;
  memory: AgentMemoryConfig;
  env: Record<string, string>;
  routingRules: AgentRoutingRule[];
  permissions: AgentPermissions;
  tools: AgentToolConfig;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  riskLevel: RiskLevel;
  workflowId?: string;
  currentVersion: number;
  versionHistory: AgentConfigVersion[];
  trustScore?: number;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

/** Usage statistics attached to registry entries */
export interface AgentUsageStats {
  executionCount: number;
  successCount: number;
  failureCount: number;
  avgLatencyMs: number;
  avgConfidence: number;
  totalCreditsUsed: number;
  totalCostUsd: number;
  lastExecutedAt?: string;
}

/** Registry entry — installed agent with metadata for Agent Studio */
export interface AgentRegistryEntry {
  config: AgentConfig;
  installedVersion: number;
  supportedModelIds: string[];
  skillIds: string[];
  dependencies: string[];
  trustScore: number;
  usage: AgentUsageStats;
  source: 'local' | 'marketplace' | 'remote' | 'builtin';
  marketplaceListingId?: string;
  remoteTargetId?: string;
}

/** Per-execution observability snapshot */
export interface ObservabilityMetrics {
  executionId: string;
  agentId: string;
  executionTimeMs: number;
  planningTimeMs?: number;
  reasoningTimeMs?: number;
  validationTimeMs?: number;
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
  provider: string;
  modelId: string;
  costUsd: number;
  creditsUsed: number;
  retries: number;
  failures: number;
  confidence: number;
  toolUsage: Array<{ toolId: string; count: number; latencyMs: number }>;
  apiLatencyMs: number;
  humanEscalations: number;
  lifecycle: AgentLifecycle;
  recordedAt: string;
}

/** Context passed through agent lifecycle methods */
export interface AgentExecutionContext {
  agentId: string;
  executionId: string;
  input: PlanInput;
  plan?: Plan;
  tenantId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

/** Result of a single lifecycle step */
export interface AgentStepResult<T = Record<string, unknown>> {
  success: boolean;
  phase: AgentLifecyclePhase;
  output?: T;
  error?: string;
  metrics?: Partial<ObservabilityMetrics>;
}
