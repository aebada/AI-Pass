import type { Execution, Plan, PlanInput } from '@ai-pass/runtime-core';

export interface OrchestrationPlanRequest {
  input: PlanInput;
}

export interface OrchestrationPlanResponse {
  plan: Plan;
  demo?: boolean;
}

export interface OrchestrationExecuteRequest {
  planId?: string;
  plan?: Plan;
  input?: PlanInput;
  mode?: 'sequential' | 'parallel';
  outputFormat?: 'json' | 'executive_summary' | 'business_report';
}

export interface OrchestrationExecuteResponse {
  execution: Execution;
  demo?: boolean;
}
