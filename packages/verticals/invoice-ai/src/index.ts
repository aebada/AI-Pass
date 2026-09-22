export * from './api-types.js';
export {
  DEMO_TENANT_ID,
  DEMO_INVOICES,
  DEMO_VENDORS,
  DEMO_FRAUD_ALERTS,
  DEMO_APPROVALS,
  DEMO_WORKFLOWS,
  DEMO_VALIDATIONS,
  DEMO_AUDIT_LOGS,
  DEMO_AUTOMATION_PACKS,
  DEMO_AUTOMATION_PACKS as INVOICE_AUTOMATION_PACKS,
  getDashboardStats,
} from './demo-data.js';
export * from './agents.js';
export * from './membership-gates.js';
export * from './livesync.js';
export { OcrService } from './services/ocr-service.js';
export { ValidationEngine } from './services/validation-engine.js';
export { FraudEngine } from './services/fraud-engine.js';
export { ApprovalEngine } from './services/approval-engine.js';
export { InvoiceAIService, defaultInvoiceAIService } from './services/invoice-service.js';
export { ERPService, defaultERPService } from './services/erp-service.js';
export * from './services/erp-livesync.js';

import { createAgentStudio } from '@ai-pass/agent-studio';
import { createMarketplacePlatform } from '@ai-pass/marketplace';
import { INVOICE_AI_AGENTS } from './agents.js';
import { defaultInvoiceAIService } from './services/invoice-service.js';

export function createInvoiceAIPlatform() {
  const marketplace = createMarketplacePlatform();
  const studio = createAgentStudio(marketplace.skills, marketplace.skillExecutor);

  for (const agentDef of INVOICE_AI_AGENTS) {
    if (!studio.registry.get(agentDef.id)) {
      studio.registry.create(agentDef);
    }
  }

  return {
    service: defaultInvoiceAIService,
    agents: studio.registry,
    execution: studio.execution,
    marketplace,
  };
}

export const defaultInvoiceAIPlatform = createInvoiceAIPlatform();
