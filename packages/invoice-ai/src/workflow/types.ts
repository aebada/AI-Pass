import type { InvoiceWorkflow } from '@ai-pass/shared/invoice-ai';

export type WorkflowStepType =
  | 'trigger'
  | 'extract'
  | 'validate'
  | 'fraud'
  | 'compliance'
  | 'bookkeeping'
  | 'approve'
  | 'condition'
  | 'notify'
  | 'payment';

export type WorkflowRunStatus = 'pending' | 'running' | 'completed' | 'failed' | 'awaiting_approval';

export interface WorkflowRunContext {
  tenantId: string;
  userId: string;
  invoiceId?: string;
  fileName?: string;
  variables: Record<string, unknown>;
}

export interface WorkflowStepResult {
  stepId: string;
  stepType: WorkflowStepType;
  status: 'passed' | 'failed' | 'skipped' | 'awaiting_approval';
  output?: Record<string, unknown>;
  message?: string;
}

export interface WorkflowRunResult {
  workflowId: string;
  runId: string;
  status: WorkflowRunStatus;
  steps: WorkflowStepResult[];
  startedAt: string;
  completedAt?: string;
}

export interface WorkflowCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains';
  value: unknown;
}

export type { InvoiceWorkflow };
