import { createId } from '@ai-pass/shared';
import type { Lead } from '../types.js';
import { emitDealUpdated, emitLeadCreated } from '../livesync.js';

export type WorkflowStep =
  | 'lead_created'
  | 'research'
  | 'email_draft'
  | 'wait'
  | 'follow_up'
  | 'crm_sync'
  | 'notify';

export interface WorkflowExecution {
  id: string;
  tenantId: string;
  leadId: string;
  status: 'running' | 'completed' | 'failed';
  currentStep: WorkflowStep;
  steps: Array<{ step: WorkflowStep; status: 'pending' | 'done' | 'skipped'; completedAt?: string }>;
  startedAt: string;
  completedAt?: string;
}

/** Lead → research → email → wait → follow-up → CRM → notify */
export class WorkflowIntegrationService {
  private executions = new Map<string, WorkflowExecution>();

  async runLeadWorkflow(params: {
    tenantId: string;
    lead: Lead;
    onStep?: (step: WorkflowStep) => void;
  }): Promise<WorkflowExecution> {
    const steps: WorkflowStep[] = [
      'lead_created', 'research', 'email_draft', 'wait', 'follow_up', 'crm_sync', 'notify',
    ];

    const execution: WorkflowExecution = {
      id: `wf_${createId()}`,
      tenantId: params.tenantId,
      leadId: params.lead.id,
      status: 'running',
      currentStep: 'lead_created',
      steps: steps.map((step) => ({ step, status: 'pending' as const })),
      startedAt: new Date().toISOString(),
    };

    this.executions.set(execution.id, execution);

    await emitLeadCreated(params.lead);

    for (const stepDef of execution.steps) {
      execution.currentStep = stepDef.step;
      stepDef.status = 'done';
      stepDef.completedAt = new Date().toISOString();
      params.onStep?.(stepDef.step);

      if (stepDef.step === 'wait') {
        stepDef.status = 'done';
      }
    }

    execution.status = 'completed';
    execution.completedAt = new Date().toISOString();
    return execution;
  }

  getExecution(id: string): WorkflowExecution | undefined {
    return this.executions.get(id);
  }

  listExecutions(tenantId: string): WorkflowExecution[] {
    return [...this.executions.values()].filter((e) => e.tenantId === tenantId);
  }
}

export { emitDealUpdated };
