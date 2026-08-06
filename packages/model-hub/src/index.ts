export type {
  HubProviderId,
  ModelProviderId,
  ModelCategory,
  AIPassFamily,
  ModelCapability,
  ModelStatus,
  ModelPricingTier,
  MembershipPlanGate,
  ModelPricing,
  ModelTrustScores,
  ModelRecord,
  ModelCatalogFilters,
  RoutingRule,
  RoutingContext,
  ModelRouteResolution,
  GovernancePolicy,
  ModelComparisonResult,
  ComparisonDimension,
  FineTuneProject,
  ProviderConnection,
  ModelUsageRecord,
} from './types.js';

export {
  MODEL_REGISTRY,
  ROUTING_RULES,
  ModelRegistry,
  defaultModelRegistry,
} from './registry.js';

export {
  resolveModel,
  ModelRouter,
  defaultModelRouter,
  autoRoute,
  getFallbackChain,
} from './router.js';

export {
  PLAN_GATES,
  canAccessModel,
  getPlanEntitlements,
  listAllowedModelIds,
} from './membership.js';

export {
  deductCredits,
  getWalletBalance,
  estimateRequestCredits,
  topUpCredits,
  type CreditDeductionRequest,
  type CreditDeductionResult,
} from './wallet.js';

export {
  getModelTrust,
  getTrustReport,
  rankByTrust,
  isHighTrust,
  trustLabel,
} from './trust.js';

export {
  saveByoKey,
  getByoKey,
  listByoKeys,
  removeByoKey,
  removeByoKey as removeByoKeyByProvider,
  maskApiKey,
  type StoredKey,
} from './byo-keys.js';

export {
  compareModels,
  getBenchmarkScores,
  BENCHMARK_SUITES,
} from './compare.js';

export {
  getModels,
  getModelById,
  getModelCount,
  MODEL_REGISTRY_COUNT,
  AIPASS_MODELS,
  MODEL_CATEGORIES,
  MODEL_CAPABILITIES,
  MODEL_PROVIDERS,
  PROVIDER_DEFINITIONS,
  resolveModelRoute,
  listRoutingRules,
  DEFAULT_ROUTING_RULES,
  type RoutingMode,
  type AutoRouteRequest,
  type AutoRouteResult,
} from './catalog.js';

export {
  DEFAULT_GOVERNANCE_POLICIES,
  isModelAllowedByPolicy,
  getGovernancePolicy,
} from './governance.js';

export type {
  MembershipPlan,
  ModelProvider,
  SupportedTask,
  LegacyModelRecord,
  RoutingResult,
  BYOKeyRecord,
} from './legacy-api.js';

export {
  PROVIDER_LABELS,
  toLegacyModel,
  getModel,
  loadBYOKeys,
  addBYOKey,
  removeBYOKey,
  revokeBYOKey,
  testAndUpdateKey,
  testConnection,
} from './legacy-api.js';
