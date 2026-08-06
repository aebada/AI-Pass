import { createId } from '@ai-pass/shared';
import type { OrchestratorPlan } from './types.js';

/** Stub planner — selects agent chain based on document context */
export class InvoicePlanner {
  planForUpload(fileName: string, useCaseId?: string): OrchestratorPlan {
    const isConstruction =
      useCaseId === 'construction_procure_to_pay' ||
      fileName.toLowerCase().includes('delivery') ||
      fileName.toLowerCase().includes('concrete');

    const steps: OrchestratorPlan['steps'] = [
      { agentId: 'agent_extraction', role: 'extractor', order: 1 },
      { agentId: 'agent_validation', role: 'validator', order: 2 },
      { agentId: 'agent_fraud', role: 'fraud', order: 3 },
      { agentId: 'agent_compliance', role: 'compliance', order: 4 },
    ];

    if (isConstruction) {
      steps.push({ agentId: 'agent_audit', role: 'bookkeeper', order: 5 });
    }

    steps.push({ agentId: 'agent_approval', role: 'approver', order: steps.length + 1 });

    return {
      id: `plan_${createId()}`,
      name: isConstruction ? 'Procure-to-Pay Pipeline' : 'Standard Invoice Pipeline',
      steps,
      mergeStrategy: 'sequential',
    };
  }
}

export const defaultInvoicePlanner = new InvoicePlanner();
