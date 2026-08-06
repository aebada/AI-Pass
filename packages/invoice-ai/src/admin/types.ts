export interface AdminTokenUsage {
  modelId: string;
  providerId: string;
  inputTokens: number;
  outputTokens: number;
  requests: number;
  costUsd: number;
}

export interface AdminWorkflowRunSummary {
  workflowId: string;
  workflowName: string;
  runsToday: number;
  successRate: number;
  lastRunAt: string;
}

export interface AdminPlatformMetrics {
  tenantId: string;
  period: string;
  totalCostUsd: number;
  totalCredits: number;
  totalTokens: number;
  activeModelRouter: string;
  tokenUsage: AdminTokenUsage[];
  workflowRuns: AdminWorkflowRunSummary[];
  piiMaskedRequests: number;
  agentRuns: number;
}
