export type {
  ModuleStatus,
  ModuleTier,
  ModuleCategory,
  ModulePermission,
  PlatformModuleDef,
  NavItem,
  WorkspaceUser,
  WorkspaceState,
  WorkspaceContextValue,
} from './types.js';

export { PLATFORM_MODULE_DEFS } from './modules.js';
export { ModuleRegistry, defaultModuleRegistry } from './module-registry.js';
export {
  buildWorkspaceNav,
  buildWorkspaceNavSections,
  buildModuleGrid,
  WORKSPACE_BRAND,
} from './navigation.js';
export type { WorkspaceNavSection } from './navigation.js';
export {
  PLATFORM_NAV_SECTIONS,
  PLATFORM_PRIMARY_NAV,
  buildPlatformNavigation,
} from './platform-navigation.js';
export type { PlatformNavSection } from './platform-navigation.js';

export {
  createDefaultWorkspaceState,
  createWorkspaceUser,
  tierMeetsRequirement,
  userHasPermission,
  createWorkspaceContextStub,
} from './workspace-context.js';

export {
  WorkspaceService,
  defaultWorkspaceService,
  createEmptyDashboard,
  getDemoDashboard,
} from './workspace-service.js';
export type {
  WorkspaceTask,
  WorkspaceAgentSummary,
  WorkspaceWorkflowSummary,
  WorkspaceCreditsSummary,
  WorkspaceNotification,
  WorkspaceActivityItem,
  WorkspaceApproval,
  WorkspaceInsight,
  WorkspaceRecommendation,
  WorkspaceQuickAction,
  WorkspaceDashboardData,
  WorkspaceDashboardOptions,
} from './workspace-service.js';

export {
  GlobalSearchService,
  defaultGlobalSearchService,
} from './global-search.js';
export type {
  SearchResultType,
  SearchResult,
  SearchOptions,
} from './global-search.js';

export {
  createTenantContext,
  tenantHasFeature,
  DEMO_TENANT,
} from './tenant-context.js';
export type {
  TenantPlan,
  TenantContext,
  TenantIsolationPolicy,
  TenantSession,
} from './tenant-context.js';

export {
  DefaultOrganizationService,
  defaultOrganizationService,
} from './organization.js';
export type {
  OrgRole,
  Organization,
  Department,
  Team,
  Project,
  RbacAssignment,
  OrganizationService,
} from './organization.js';

export {
  PlatformEventBus,
  defaultPlatformEventBus,
} from './event-bus.js';
export type {
  PlatformEventType,
  PlatformEvent,
  PlatformEventHandler,
  LiveSyncBridge,
} from './event-bus.js';

export type {
  ApiResponse,
  ApiError,
  ApiMeta,
  PaginatedResponse,
  HealthResponse,
  ModulesListResponse,
} from './api-conventions.js';
export {
  API_VERSION,
  API_BASE,
  createMeta,
  ok,
} from './api-conventions.js';

export { wireRuntimeToPlatform, getPlatformRuntime } from './runtime-registry.js';
export type { ModuleRegistryWithRuntime, PlatformRuntimeBridge } from './runtime-registry.js';

export {
  EXTERNAL_PROJECT_LINKS,
  getExternalProject,
} from './external-projects.js';
export type { ExternalProjectLink } from './external-projects.js';
export {
  INTEGRATIONS,
  getIntegration,
  checkIntegrationHealth,
} from './integrations.js';
export type {
  IntegrationDefinition,
  IntegrationAuthMode,
  IntegrationHealth,
} from './integrations.js';
