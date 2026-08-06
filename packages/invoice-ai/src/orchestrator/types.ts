export type OrchestratorAgentRole =
  | 'planner'
  | 'extractor'
  | 'validator'
  | 'fraud'
  | 'compliance'
  | 'bookkeeper'
  | 'approver'
  | 'chat';

export interface OrchestratorStep {
  agentId: string;
  role: OrchestratorAgentRole;
  order: number;
  optional?: boolean;
}

export interface OrchestratorPlan {
  id: string;
  name: string;
  steps: OrchestratorStep[];
  mergeStrategy: 'sequential' | 'parallel' | 'supervisor';
}

export interface OrchestratorRunResult {
  planId: string;
  runId: string;
  stepsCompleted: number;
  outputs: Record<string, unknown>;
  creditsUsed: number;
  status: 'completed' | 'partial' | 'failed';
}
