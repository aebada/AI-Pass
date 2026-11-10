export * from './types.js';
export * from './membership-gates.js';
export * from './provider-routing.js';
export * from './trust.js';
export * from './livesync.js';
export * from './discovery-integration.js';
export * from './demo-data.js';

export { CompanyService } from './services/company-service.js';
export { AuditService } from './services/audit-service.js';
export { ProviderService, AUDIT_PROVIDERS, PROVIDER_LABELS } from './services/provider-service.js';
export { ScoringEngine, RepresentationAnalysis, GapDetection } from './services/scoring-engine.js';
export { CompetitorService } from './services/competitor-service.js';
export { OptimizationEngine } from './services/optimization-engine.js';
export { PromptCoverage, PREDEFINED_PROMPTS } from './services/prompt-coverage.js';
export { SimulationService } from './services/simulation-service.js';
export { MonitoringService, AlertService } from './services/monitoring-service.js';
export { ReportingService } from './services/reporting-service.js';
export { AnalyticsService } from './services/analytics-service.js';
export {
  PresenceAuditPlatform,
  defaultPresenceAuditPlatform,
} from './services/presence-platform.js';

/** @deprecated Use PresenceAuditPlatform */
export { QueryEngine } from './legacy.js';
export { MultiModelAuditEngine } from './legacy.js';
export { PresenceScoring } from './legacy.js';
export { PresenceAuditService, createPresenceAuditPlatform } from './legacy.js';

import { createMarketplacePlatform } from '@ai-pass/marketplace';
import { defaultPresenceAuditPlatform, PresenceAuditPlatform } from './services/presence-platform.js';
import { seedPresenceAuditDemo } from './demo-data.js';

export function createPresenceAuditPlatformService(): PresenceAuditPlatform {
  const platform = new PresenceAuditPlatform();
  seedPresenceAuditDemo(platform);
  return platform;
}

export function bootstrapPresenceAuditMarketplace() {
  const marketplace = createMarketplacePlatform();
  return {
    platform: defaultPresenceAuditPlatform,
    marketplace,
  };
}
