/** Backward-compatible exports for LiveSync and legacy consumers */

import type { GovernanceEvaluation } from '@ai-pass/shared';
import { getGovernanceService } from './governance-service.js';

export { AISystemInventory } from './legacy/inventory.js';
export { PolicyEngine } from './legacy/policy-engine.js';
export { GovernanceWorkflow } from './legacy/workflow.js';
export { DriftMonitor } from './legacy/drift-monitor.js';

/** LiveSync integration hook — delegates to GovernanceService */
export class GovernanceHook {
  private svc = getGovernanceService();

  async onPolicyEvent(params: {
    type: string;
    severity: string;
    systemId: string;
    details: Record<string, unknown>;
  }): Promise<{ escalated: boolean; approvalId?: string }> {
    return this.svc.onLiveSyncEvent(params);
  }

  evaluatePolicies(params: {
    systemId: string;
    action: string;
    context: Record<string, unknown>;
  }): GovernanceEvaluation {
    return this.svc.evaluateAndEnforce(params);
  }
}

export { GovernanceService, getGovernanceService, resetGovernanceService, createGovernancePlatform } from './governance-service.js';
export { InventoryService } from './inventory-service.js';
export { PolicyService } from './policy-service.js';
export { PolicyEnforcementEngine } from './policy-enforcement-engine.js';
export type { EnforcementContext } from './policy-enforcement-engine.js';
export { RiskService } from './risk-service.js';
export { ApprovalService } from './approval-service.js';
export { MonitoringService } from './monitoring-service.js';
export { ReportingService } from './reporting-service.js';
export type { ReportResult } from './reporting-service.js';
export { NotificationService } from './notification-service.js';
export type { NotificationPayload, NotificationResult } from './notification-service.js';
export { AuditService } from './audit-service.js';
export { WorkflowEngine, DEFAULT_LIFECYCLE } from './workflow-engine.js';
export type { WorkflowStepResult } from './workflow-engine.js';
export {
  SEED_SYSTEMS,
  SEED_POLICIES,
  SEED_RISKS,
  SEED_APPROVALS,
  SEED_MONITORING,
  SEED_COMPLIANCE_MAPPINGS,
} from './seed-data.js';
