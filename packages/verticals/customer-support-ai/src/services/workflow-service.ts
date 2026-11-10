import { createId } from '@ai-pass/shared';
import type { WorkflowExecution } from '../types.js';

const REFUND_WORKFLOW = {
  id: 'wf_refund',
  name: 'Refund Processing Flow',
  steps: ['validate_order', 'check_policy', 'calculate_amount', 'approve_or_escalate', 'process_refund'],
};

/** Workflow engine stub — refund flow example */
export class WorkflowService {
  private executions = new Map<string, WorkflowExecution>();

  startRefundFlow(conversationId: string, orderId?: string): WorkflowExecution {
    const execution: WorkflowExecution = {
      id: `wfx_${createId()}`,
      conversationId,
      workflowId: REFUND_WORKFLOW.id,
      workflowName: REFUND_WORKFLOW.name,
      status: 'running',
      currentStep: 'validate_order',
      result: { orderId, stubbed: true },
      startedAt: new Date().toISOString(),
    };
    this.executions.set(execution.id, execution);
    this.advance(execution.id);
    return execution;
  }

  advance(executionId: string): WorkflowExecution | undefined {
    const exec = this.executions.get(executionId);
    if (!exec || exec.status !== 'running') return exec;

    const steps = REFUND_WORKFLOW.steps;
    const currentIdx = exec.currentStep ? steps.indexOf(exec.currentStep) : -1;
    const nextIdx = currentIdx + 1;

    if (nextIdx >= steps.length) {
      exec.status = 'completed';
      exec.currentStep = undefined;
      exec.completedAt = new Date().toISOString();
      exec.result = { ...exec.result, approved: true, refundAmount: 49.99, stubbed: true };
    } else {
      exec.currentStep = steps[nextIdx];
    }

    return exec;
  }

  get(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }

  listByConversation(conversationId: string): WorkflowExecution[] {
    return [...this.executions.values()].filter((e) => e.conversationId === conversationId);
  }
}
