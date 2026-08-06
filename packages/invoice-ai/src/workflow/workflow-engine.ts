import { createId } from '@ai-pass/shared';
import type { InvoiceWorkflow } from '@ai-pass/shared/invoice-ai';
import type {
  WorkflowCondition,
  WorkflowRunContext,
  WorkflowRunResult,
  WorkflowStepResult,
  WorkflowStepType,
} from './types.js';

export class WorkflowEngine {
  async execute(
    workflow: InvoiceWorkflow,
    context: WorkflowRunContext,
  ): Promise<WorkflowRunResult> {
    const runId = `wfr_${createId()}`;
    const startedAt = new Date().toISOString();
    const steps: WorkflowStepResult[] = [];
    let status: WorkflowRunResult['status'] = 'running';
    let halted = false;

    for (const step of workflow.steps) {
      if (halted) {
        steps.push({ stepId: step.id, stepType: step.type as WorkflowStepType, status: 'skipped' });
        continue;
      }

      const result = this.executeStep(step, context, workflow);
      steps.push(result);

      if (result.status === 'failed') {
        status = 'failed';
        halted = true;
      } else if (result.status === 'awaiting_approval') {
        status = 'awaiting_approval';
        halted = true;
      } else if (step.type === 'condition' && result.output?.passed === false) {
        halted = true;
      }
    }

    if (status === 'running') status = 'completed';

    return {
      workflowId: workflow.id,
      runId,
      status,
      steps,
      startedAt,
      completedAt: status === 'awaiting_approval' ? undefined : new Date().toISOString(),
    };
  }

  evaluateCondition(condition: WorkflowCondition, variables: Record<string, unknown>): boolean {
    const actual = variables[condition.field];
    switch (condition.operator) {
      case 'eq': return actual === condition.value;
      case 'neq': return actual !== condition.value;
      case 'gt': return Number(actual) > Number(condition.value);
      case 'gte': return Number(actual) >= Number(condition.value);
      case 'lt': return Number(actual) < Number(condition.value);
      case 'lte': return Number(actual) <= Number(condition.value);
      case 'contains':
        return String(actual).toLowerCase().includes(String(condition.value).toLowerCase());
      default: return false;
    }
  }

  private executeStep(
    step: InvoiceWorkflow['steps'][number],
    context: WorkflowRunContext,
    workflow: InvoiceWorkflow,
  ): WorkflowStepResult {
    const stepType = step.type as WorkflowStepType;

    switch (stepType) {
      case 'trigger':
        return {
          stepId: step.id,
          stepType,
          status: 'passed',
          output: { triggeredBy: context.userId, mode: workflow.mode },
        };

      case 'extract':
        return {
          stepId: step.id,
          stepType,
          status: 'passed',
          output: { agentId: step.agentId ?? 'agent_extraction', fileName: context.fileName },
        };

      case 'validate':
      case 'fraud':
      case 'compliance':
      case 'bookkeeping':
        return {
          stepId: step.id,
          stepType,
          status: 'passed',
          output: { agentId: step.agentId, invoiceId: context.invoiceId },
        };

      case 'condition': {
        const conditions = (step.config?.conditions as WorkflowCondition[] | undefined) ?? [];
        const passed = conditions.every((c) => this.evaluateCondition(c, context.variables));
        return {
          stepId: step.id,
          stepType,
          status: passed ? 'passed' : 'skipped',
          output: { passed },
          message: passed ? 'All conditions met' : 'Condition branch skipped',
        };
      }

      case 'approve':
        if (workflow.mode === 'autonomous') {
          return {
            stepId: step.id,
            stepType,
            status: 'passed',
            output: { autoApproved: true },
          };
        }
        return {
          stepId: step.id,
          stepType,
          status: 'awaiting_approval',
          output: { approverRole: step.config?.approverRole ?? 'finance_manager' },
          message: 'Awaiting human approval',
        };

      case 'notify':
      case 'payment':
        return {
          stepId: step.id,
          stepType,
          status: 'passed',
          output: { notified: true },
        };

      default:
        return { stepId: step.id, stepType, status: 'skipped', message: `Unknown step: ${step.type}` };
    }
  }
}

export const defaultWorkflowEngine = new WorkflowEngine();
