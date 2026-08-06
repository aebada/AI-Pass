import { createGovernancePlatform } from '@ai-pass/governance';
import type { AISystem } from './types.js';

const governance = createGovernancePlatform();

/** Delegates AI inventory and policy evaluation to packages/governance — no duplication */
export class GovernanceIntegration {
  listAISystems() {
    return governance.inventory.list();
  }

  getAISystem(systemId: string) {
    return governance.inventory.get(systemId);
  }

  registerAISystem(params: {
    name: string;
    type: 'agent' | 'workflow' | 'application' | 'model';
    ownerId: string;
    department: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }) {
    return governance.inventory.register({
      name: params.name,
      type: params.type === 'model' ? 'application' : params.type,
      ownerId: params.ownerId,
      department: params.department,
      businessPurpose: 'Registered via Compliance AI',
      provider: 'ai-pass',
      version: '1.0.0',
      riskClassification: params.riskLevel,
      complianceStatus: 'pending_review',
      deploymentEnvironment: 'production',
      monitoringStatus: 'active',
      connectedWorkflows: [],
      lifecycleStage: 'deployment',
    });
  }

  evaluateAIAction(params: {
    systemId: string;
    action: string;
    context: Record<string, unknown>;
  }) {
    return governance.hook.evaluatePolicies(params);
  }

  syncComplianceSystem(system: AISystem): void {
    const gov = governance.inventory.get(system.governanceSystemId);
    if (gov) {
      governance.inventory.updateCompliance(
        system.governanceSystemId,
        system.complianceStatus === 'compliant' ? 'compliant' : 'pending_review',
      );
    }
  }

  listPendingApprovals() {
    return governance.workflow.listPending();
  }
}

export const defaultGovernanceIntegration = new GovernanceIntegration();
