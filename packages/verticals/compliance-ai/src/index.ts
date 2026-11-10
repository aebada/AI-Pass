export * from './types.js';
export * from './api-types.js';
export * from './demo-data.js';
export * from './agents.js';
export * from './membership-gates.js';
export * from './livesync.js';
export * from './governance-integration.js';
export * from './trust-integration.js';
export * from './knowledge.js';
export * from './workflow-integration.js';

export { AuditService } from './services/audit-service.js';
export { FrameworkService } from './services/framework-service.js';
export { ControlService, TaskService } from './services/control-service.js';
export { RiskService } from './services/risk-service.js';
export { VendorService, VENDOR_INTEGRATIONS } from './services/vendor-service.js';
export { EmployeeComplianceService } from './services/employee-compliance-service.js';
export { PolicyService, POLICY_TEMPLATES } from './services/policy-service.js';
export { EvidenceService } from './services/evidence-service.js';
export { TrustCenterService } from './services/trust-center-service.js';
export { CopilotService } from './services/copilot-service.js';
export { ReportingService } from './services/reporting-service.js';
export {
  ComplianceAIService,
  defaultComplianceAIService,
} from './services/compliance-ai-service.js';

import { createAgentStudio } from '@ai-pass/agent-studio';
import { createMarketplacePlatform } from '@ai-pass/marketplace';
import { COMPLIANCE_AI_AGENTS } from './agents.js';
import { defaultComplianceAIService } from './services/compliance-ai-service.js';

export function createComplianceAIPlatform() {
  const marketplace = createMarketplacePlatform();
  const studio = createAgentStudio(marketplace.skills, marketplace.skillExecutor);
  for (const agentDef of COMPLIANCE_AI_AGENTS) {
    studio.registry.create(agentDef);
  }
  return {
    service: defaultComplianceAIService,
    agents: studio.registry,
    execution: studio.execution,
    marketplace,
  };
}

export const defaultComplianceAIPlatform = createComplianceAIPlatform();
