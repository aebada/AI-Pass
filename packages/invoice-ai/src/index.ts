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
  DEMO_DELIVERY_NOTES,
  DEMO_PURCHASE_ORDERS,
  DEMO_UPCOMING_DELIVERIES,
  DEMO_MATERIAL_CONSUMPTION,
  DEMO_SUPPLY_OFFERS,
  DEFAULT_SUPPLY_CHAIN_RULES,
  DEMO_SUPPLY_CHAIN_WORKFLOWS,
  DEMO_TENDERS,
  getDashboardStats,
} from './demo-data.js';
export * from './agents.js';
export * from './membership-gates.js';
export * from './livesync.js';
export { OcrService } from './services/ocr-service.js';
export { ValidationEngine } from './services/validation-engine.js';
export { FraudEngine } from './services/fraud-engine.js';
export {
  buildFakeInvoiceDetection,
  computeFakeInvoiceVerdict,
  parseStoredSignals,
} from './services/fake-invoice-detection.js';
export { ComplianceEngine } from './services/compliance-engine.js';
export { UseCaseEngine, BUILTIN_USE_CASES } from './services/use-case-engine.js';
export { ProcureToPayEngine } from './services/procure-to-pay-engine.js';
export { SupplyChainEngine } from './services/supply-chain-engine.js';
export { ApprovalEngine } from './services/approval-engine.js';
export { InvoiceAIService, type InvoiceAIServiceSnapshot } from './services/invoice-service.js';
export {
  defaultInvoiceAIService,
  getDefaultInvoiceAIService,
  getInvoiceAIService,
  resetInvoiceAIServiceRegistry,
  type GetInvoiceAIServiceOptions,
} from './services/service-registry.js';
export { ERPService, defaultERPService } from './services/erp-service.js';
export * from './services/erp-livesync.js';
export * from './middleware/index.js';
export * from './orchestrator/index.js';
export * from './workflow/index.js';
export * from './tenant/index.js';
export * from './admin/index.js';
export * from './ocr/index.js';
export * from './reporting/index.js';
export * from './integrations/index.js';

import { createAgentStudio } from '@ai-pass/agent-studio';
import { createMarketplacePlatform } from '@ai-pass/marketplace';
import { INVOICE_AI_AGENTS } from './agents.js';
import { getDefaultInvoiceAIService } from './services/service-registry.js';

export function createInvoiceAIPlatform() {
  const marketplace = createMarketplacePlatform();
  const studio = createAgentStudio(marketplace.skills, marketplace.skillExecutor);

  for (const agentDef of INVOICE_AI_AGENTS) {
    if (!studio.registry.get(agentDef.id)) {
      studio.registry.create(agentDef);
    }
  }

  return {
    service: getDefaultInvoiceAIService(),
    agents: studio.registry,
    execution: studio.execution,
    marketplace,
  };
}

let cachedPlatform: ReturnType<typeof createInvoiceAIPlatform> | undefined;

export function getDefaultInvoiceAIPlatform() {
  if (!cachedPlatform) {
    cachedPlatform = createInvoiceAIPlatform();
  }
  return cachedPlatform;
}

/** Lazy platform singleton — avoids heavy init during static export / SSR. */
export const defaultInvoiceAIPlatform = new Proxy({} as ReturnType<typeof createInvoiceAIPlatform>, {
  get(_target, prop, receiver) {
    const platform = getDefaultInvoiceAIPlatform();
    const value = Reflect.get(platform, prop, receiver);
    return typeof value === 'function' ? value.bind(platform) : value;
  },
});
