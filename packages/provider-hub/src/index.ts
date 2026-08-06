export type {
  HubProviderId,
  AuthMode,
  ModelSpeed,
  ModelQuality,
  ModelTier,
  ModelAvailability,
  TaskType,
  ModelCatalogEntry,
  ProviderDefinition,
  CatalogSearchFilters,
  RoutingCriteria,
  RoutingDecision,
  ProviderHealth,
  AuthConfig,
  HubRequestContext,
  HubChatRequest,
  HubExecuteRequest,
  HubExecuteResponse,
  ProviderHubOptions,
} from './types.js';

export {
  MODEL_CATALOG,
  PROVIDER_DEFINITIONS,
  ProviderRegistry,
  ModelCatalog,
  defaultProviderRegistry,
  defaultModelCatalog,
} from './catalog.js';

export {
  RoutingEngine,
  defaultRoutingEngine,
} from './routing-engine.js';
export { HealthMonitor, defaultHealthMonitor } from './health-monitor.js';

export {
  AUTO_MODEL_IDS,
  AUTO_MODEL_META,
  isAutoModelId,
  parseAutoComplexity,
  scorePerformanceToPrice,
  selectAutoModel,
  resolveAutoOrDirectModelId,
  type AutoComplexity,
  type AutoRouteOptions,
  type AutoRouteDecision,
} from './auto-models.js';

export {
  ProviderHub,
  createProviderHub,
  createProviderHubFromConfig,
  createHubContext,
  buildSystemPrompt,
} from './provider-hub.js';

export {
  createManagedAuthFromEnv,
  getEnvFreeMonthlyCredits,
  getEnvFreeDailyRequests,
} from './env-auth.js';

export {
  resolveModel,
  type ResolveModelOptions,
} from './model-hub-bridge.js';
