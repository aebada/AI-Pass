export type {
  Capability,
  CapabilityDefinition,
  GroupSource,
  GovernanceSnapshot,
  LegacyBuilderRole,
  ScimConfig,
  WorkspaceGroup,
  WorkspaceMember,
  WorkspaceRole,
} from './types.js';

export {
  ADMIN_ONLY_CAPABILITIES,
  CAPABILITY_CATALOG,
  CAPABILITY_IDS,
  getCapability,
} from './capabilities.js';

export {
  BUILDER_EQUIVALENT_CAPABILITIES,
  ROLE_CAPABILITIES,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  isSensitiveCapability,
  roleGrantsAll,
} from './roles.js';

export {
  can,
  canManageSensitiveSettings,
  isManagerOnly,
  resolveEffectiveCapabilities,
} from './resolve.js';

export {
  BUILDERS_GROUP_SLUG,
  createBuildersGroup,
  migrateBuildersToGroup,
} from './migrate.js';

export { WorkspaceRbacService, getWorkspaceRbacService } from './demo-store.js';
