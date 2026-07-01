import type { WorkflowDefinition } from '@ai-pass/shared';

export const DEFAULT_WORKFLOWS: WorkflowDefinition[] = [
  {
    id: 'wf_invoice_validation',
    name: 'Invoice Validation Workflow',
    description: 'Validates uploaded invoices and returns PASS/FAIL decision',
    steps: [
      { id: 'step_validate', type: 'agent', name: 'Validate invoice fields' },
      { id: 'step_governance', type: 'governance_check', name: 'Policy compliance check' },
      { id: 'step_notify', type: 'notify', name: 'Notify downstream systems' },
    ],
  },
  {
    id: 'wf_supplier_recommendation',
    name: 'Supplier Recommendation Recalculation',
    description: 'Re-evaluates supplier recommendation on data update',
    steps: [
      { id: 'step_analyze', type: 'agent', name: 'Analyze supplier metrics' },
      { id: 'step_notify', type: 'notify', name: 'Push recommendation update' },
    ],
  },
  {
    id: 'wf_analysis_auto_run',
    name: 'Analysis Studio Auto-Run',
    description: 'Triggers analysis pipeline when dataset is uploaded',
    steps: [
      { id: 'step_run', type: 'agent', name: 'Run analysis agent' },
      { id: 'step_knowledge', type: 'knowledge_sync', name: 'Index analysis outputs' },
    ],
  },
  {
    id: 'wf_knowledge_sync',
    name: 'Knowledge Pipeline Sync',
    description: 'Synchronizes knowledge sources after data changes',
    steps: [
      { id: 'step_sync', type: 'knowledge_sync', name: 'Sync knowledge source' },
      { id: 'step_validate', type: 'agent', name: 'Validate indexed content' },
    ],
  },
  {
    id: 'wf_governance_escalation',
    name: 'Governance Escalation Workflow',
    description: 'Escalates policy violations for human review',
    steps: [
      { id: 'step_check', type: 'governance_check', name: 'Evaluate violation severity' },
      { id: 'step_agent', type: 'agent', name: 'Generate risk assessment' },
      { id: 'step_notify', type: 'notify', name: 'Alert governance officers' },
    ],
  },
  {
    id: 'wf_customer_onboard',
    name: 'Customer Onboarding Workflow',
    description: 'Handles customer and user lifecycle events',
    steps: [
      { id: 'step_agent', type: 'agent', name: 'Process customer event' },
      { id: 'step_notify', type: 'notify', name: 'Notify CRM sync' },
    ],
  },
  {
    id: 'wf_marketplace_onboard',
    name: 'Marketplace App Onboarding',
    description: 'Post-install configuration and sync',
    steps: [
      { id: 'step_governance', type: 'governance_check', name: 'Security review' },
      { id: 'step_notify', type: 'notify', name: 'Sync marketplace state' },
    ],
  },
];

export class WorkflowRegistry {
  private workflows = new Map<string, WorkflowDefinition>();

  constructor(seed: WorkflowDefinition[] = DEFAULT_WORKFLOWS) {
    for (const wf of seed) {
      this.workflows.set(wf.id, wf);
    }
  }

  get(workflowId: string): WorkflowDefinition | undefined {
    return this.workflows.get(workflowId);
  }

  list(): WorkflowDefinition[] {
    return [...this.workflows.values()];
  }
}
