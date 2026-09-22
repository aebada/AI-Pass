export * from './types.js';
export * from './api-types.js';
export * from './demo-data.js';
export * from './skills.js';
export * from './agents.js';
export * from './membership-gates.js';
export * from './livesync.js';
export * from './trust.js';
export * from './provider-routing.js';
export { EmailAssistantService } from './services/email-assistant.js';
export { LinkedInAssistantService } from './services/linkedin-assistant.js';
export { ProposalGeneratorService } from './services/proposal-generator.js';
export { SalesCopilotService } from './services/sales-copilot.js';
export { MeetingPrepService } from './services/meeting-prep.js';
export { CrmService } from './services/crm-service.js';
export { PersonalizationEngine } from './services/personalization-engine.js';
export { CampaignBuilderService } from './services/campaign-builder.js';
export { AnalyticsService } from './services/analytics-service.js';
export { OutreachService } from './services/outreach-service.js';
export { WorkflowIntegrationService } from './services/workflow-integration.js';
export { KnowledgeIntegrationService } from './services/knowledge-integration.js';
export { SalesAIService, defaultSalesAIService } from './services/sales-ai-service.js';

import { createAgentStudio } from '@ai-pass/agent-studio';
import { createMarketplacePlatform } from '@ai-pass/marketplace';
import { SALES_AI_AGENTS } from './agents.js';
import { SALES_AI_SKILLS } from './skills.js';
import { defaultSalesAIService } from './services/sales-ai-service.js';

export function createSalesAIPlatform() {
  const marketplace = createMarketplacePlatform();
  for (const skill of SALES_AI_SKILLS) {
    marketplace.skills.register(skill);
  }
  const studio = createAgentStudio(marketplace.skills, marketplace.skillExecutor);
  for (const agentDef of SALES_AI_AGENTS) {
    if (!studio.registry.get(agentDef.type)) {
      studio.registry.create(agentDef);
    }
  }
  return {
    service: defaultSalesAIService,
    agents: studio.registry,
    execution: studio.execution,
    marketplace,
    skills: marketplace.skills,
  };
}

export const defaultSalesAIPlatform = createSalesAIPlatform();
