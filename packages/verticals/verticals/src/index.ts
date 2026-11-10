export { CustomerSupportEngine, SUPPORT_SKILLS } from './customer-support.js';
export { InvoiceAIEngine, INVOICE_AUTOMATION_PACKS } from './invoice-ai.js';
export {
  SupplyChainAIEngine,
  createSupplyChainPlatform,
  defaultSupplyChainAIService,
  DEFAULT_SCORING_TEMPLATES,
  DEFAULT_RULES,
  SUPPLY_CHAIN_AGENTS,
  DEMO_TENANT_ID,
} from './supply-chain.js';
export { createSupplyChainAIPlatform } from '@ai-pass/supply-chain-ai';

import { CustomerSupportEngine } from './customer-support.js';
import { InvoiceAIEngine } from './invoice-ai.js';
import { SupplyChainAIEngine } from './supply-chain.js';

export function createVerticalsPlatform() {
  return {
    customerSupport: new CustomerSupportEngine(),
    invoiceAI: new InvoiceAIEngine(),
    supplyChain: new SupplyChainAIEngine(),
  };
}
