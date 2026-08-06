import type { MembershipTier } from '@ai-pass/shared';

/** Execution lifecycle modes */
export type ExecutionMode =
  | 'sequential'
  | 'conditional'
  | 'parallel'
  | 'retry'
  | 'fallback'
  | 'timeout'
  | 'approval'
  | 'rollback';

export type TaskStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped'
  | 'needs_info'
  | 'awaiting_approval';

export type ExecutionStatus =
  | 'pending'
  | 'planning'
  | 'executing'
  | 'evaluating'
  | 'completed'
  | 'failed'
  | 'needs_info'
  | 'cancelled';

export type TaskType = 'skill' | 'model' | 'workflow' | 'automation' | 'action' | 'tool';

export interface PlanInput {
  goal: string;
  context?: Record<string, unknown>;
  constraints?: {
    maxCredits?: number;
    maxLatencyMs?: number;
    preferQuality?: boolean;
    preferCost?: boolean;
    region?: string;
    requireApproval?: boolean;
  };
  membershipTier?: MembershipTier;
  userId?: string;
  tenantId?: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  type: TaskType;
  skillId?: string;
  toolId?: string;
  workflowId?: string;
  automationId?: string;
  dependencies: string[];
  status: TaskStatus;
  estimatedCredits: number;
  config?: Record<string, unknown>;
  order: number;
}

export interface Plan {
  id: string;
  input: PlanInput;
  tasks: Task[];
  requiredTools: string[];
  requiredSkills: string[];
  requiredModels: string[];
  estimatedCredits: number;
  estimatedCostUsd: number;
  summary: string;
  createdAt: string;
}

export interface RuntimeLog {
  id: string;
  executionId: string;
  taskId?: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface RuntimeMetrics {
  totalDurationMs: number;
  planningDurationMs: number;
  executionDurationMs: number;
  evaluationDurationMs: number;
  creditsUsed: number;
  tasksCompleted: number;
  tasksFailed: number;
  providerLatencyMs: number;
  confidence: number;
}

export interface EvidenceItem {
  source: string;
  excerpt: string;
  confidence: number;
  url?: string;
}

export interface StructuredOutput {
  decision: string;
  confidence: number;
  evidence: EvidenceItem[];
  result: Record<string, unknown>;
  format: OutputFormat;
  needsInfo?: boolean;
  missingFields?: string[];
  formatted?: string | Record<string, unknown>;
}

export type OutputFormat =
  | 'json'
  | 'pdf_stub'
  | 'executive_summary'
  | 'business_report'
  | 'workflow_result'
  | 'decision'
  | 'evidence';

export interface Execution {
  id: string;
  planId: string;
  status: ExecutionStatus;
  input: PlanInput;
  plan?: Plan;
  output?: StructuredOutput;
  logs: RuntimeLog[];
  metrics: RuntimeMetrics;
  mode: ExecutionMode;
  startedAt: string;
  completedAt?: string;
}

export interface PlanRequest {
  input: PlanInput;
}

export interface PlanResponse {
  plan: Plan;
}

export interface ExecuteRequest {
  planId?: string;
  plan?: Plan;
  input?: PlanInput;
  mode?: ExecutionMode;
  outputFormat?: OutputFormat;
}

export interface ExecuteResponse {
  execution: Execution;
}
