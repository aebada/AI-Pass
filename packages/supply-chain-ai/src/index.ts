export * from './api-types.js';
export * from './demo-data.js';
export * from './agents.js';
export * from './membership-gates.js';
export * from './livesync.js';
export * from './marketplace-registration.js';
export * from './compliance-integration.js';
export * from './types.js';
export { SourcingService, parseRequirementsFromNL } from './services/sourcing-service.js';
export { SupplierService } from './services/supplier-service.js';
export { OfferParsingService } from './services/offer-parsing-service.js';
export { OfferNormalizationService } from './services/offer-normalization.js';
export { PolicyService } from './services/policy-service.js';
export { RulesEngine, DEFAULT_RULES } from './services/rules-engine.js';
export { ScoringEngine, DEFAULT_SCORING_TEMPLATES } from './services/scoring-engine.js';
export { AgentOrchestrator } from './services/agent-orchestrator.js';
export { ReportingService } from './services/reporting-service.js';
export { NotificationService } from './services/notification-service.js';
export { AuditService } from './services/audit-service.js';
export { SupplyChainAIService, defaultSupplyChainAIService } from './services/supply-chain-service.js';
export { parseTenantId, parseUserId, parseTier } from './api/handlers.js';

import { createAgentStudio } from '@ai-pass/agent-studio';
import { createMarketplacePlatform } from '@ai-pass/marketplace';
import { SUPPLY_CHAIN_AGENTS } from './agents.js';
import { registerSupplyChainSkills } from './marketplace-registration.js';
import { defaultSupplyChainAIService } from './services/supply-chain-service.js';

export function createSupplyChainAIPlatform() {
  const marketplace = createMarketplacePlatform();
  registerSupplyChainSkills(marketplace.skills);
  const studio = createAgentStudio(marketplace.skills, marketplace.skillExecutor);

  for (const agentDef of SUPPLY_CHAIN_AGENTS) {
    if (!studio.registry.get(agentDef.id)) {
      studio.registry.create(agentDef);
    }
  }

  defaultSupplyChainAIService.bindAgents(studio.registry, studio.execution);

  return {
    service: defaultSupplyChainAIService,
    agents: studio.registry,
    execution: studio.execution,
    marketplace,
  };
}

export const defaultSupplyChainAIPlatform = createSupplyChainAIPlatform();
