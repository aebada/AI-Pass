export * from './types.js';
export * from './api-types.js';
export * from './demo-data.js';
export * from './skills.js';
export * from './agents.js';
export * from './membership-gates.js';
export * from './livesync.js';
export * from './trust.js';
export * from './provider-routing.js';
export * from './discovery-integration.js';

export { DetectorService } from './services/detector-service.js';
export { HumanizerService } from './services/humanizer-service.js';
export { BatchService } from './services/batch-service.js';
export { HistoryService } from './services/history-service.js';
export { ContentAIPlatform } from './services/content-ai-platform.js';

import { createAgentStudio } from '@ai-pass/agent-studio';
import { createMarketplacePlatform } from '@ai-pass/marketplace';
import { CONTENT_AI_AGENTS } from './agents.js';
import { CONTENT_AI_SKILLS } from './skills.js';
import { DEMO_DETECTIONS, DEMO_HUMANIZATIONS } from './demo-data.js';
import { ContentAIPlatform } from './services/content-ai-platform.js';

export const defaultContentAIPlatform = new ContentAIPlatform(DEMO_DETECTIONS, DEMO_HUMANIZATIONS);

export function createContentAIPlatform() {
  const marketplace = createMarketplacePlatform();
  for (const skill of CONTENT_AI_SKILLS) {
    marketplace.skills.register(skill);
  }
  const studio = createAgentStudio(marketplace.skills, marketplace.skillExecutor);
  for (const agentDef of CONTENT_AI_AGENTS) {
    if (!studio.registry.get(agentDef.type)) {
      studio.registry.create(agentDef);
    }
  }
  return {
    platform: defaultContentAIPlatform,
    agents: studio.registry,
    execution: studio.execution,
    marketplace,
    skills: marketplace.skills,
  };
}

export const defaultContentAIPlatformService = createContentAIPlatform();
