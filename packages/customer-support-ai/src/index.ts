export * from './types.js';
export * from './api-types.js';
export * from './demo-data.js';
export * from './skills.js';
export * from './agents.js';
export * from './membership-gates.js';
export * from './livesync.js';
export * from './compliance.js';
export * from './trust.js';
export * from './provider-routing.js';
export * from './i18n.js';
export { IntentService } from './services/intent-service.js';
export { KnowledgeService } from './services/knowledge-service.js';
export { WorkflowService } from './services/workflow-service.js';
export { CrmService } from './services/crm-service.js';
export { TicketService } from './services/ticket-service.js';
export { EscalationEngine } from './services/escalation-engine.js';
export { VoiceService } from './services/voice-service.js';
export { AnalyticsService } from './services/analytics-service.js';
export { NotificationService } from './services/notification-service.js';
export { AuditService } from './services/audit-service.js';
export {
  CustomerSupportAIService,
  defaultCustomerSupportAIService,
} from './services/conversation-service.js';

import { createAgentStudio } from '@ai-pass/agent-studio';
import { createMarketplacePlatform } from '@ai-pass/marketplace';
import { CUSTOMER_SUPPORT_AGENTS } from './agents.js';
import { CUSTOMER_SUPPORT_SKILLS } from './skills.js';
import { defaultCustomerSupportAIService } from './services/conversation-service.js';

export function createCustomerSupportAIPlatform() {
  const marketplace = createMarketplacePlatform();
  for (const skill of CUSTOMER_SUPPORT_SKILLS) {
    marketplace.skills.register(skill);
  }
  const studio = createAgentStudio(marketplace.skills, marketplace.skillExecutor);
  for (const agentDef of CUSTOMER_SUPPORT_AGENTS) {
    studio.registry.create(agentDef);
  }
  return {
    service: defaultCustomerSupportAIService,
    agents: studio.registry,
    execution: studio.execution,
    marketplace,
    skills: marketplace.skills,
  };
}

export const defaultCustomerSupportAIPlatform = createCustomerSupportAIPlatform();
