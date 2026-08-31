import type { ModulePermission, ModuleTier, WorkspaceContextValue, WorkspaceState, WorkspaceUser } from './types.js';

export function createDefaultWorkspaceState(): WorkspaceState {
  return {
    activeModuleId: 'workspace',
    sidebarCollapsed: false,
    theme: 'dark',
  };
}

export function createWorkspaceUser(overrides?: Partial<WorkspaceUser>): WorkspaceUser {
  return {
    id: 'anonymous',
    name: 'User',
    email: '',
    avatarInitials: 'U',
    plan: 'free',
    workspace: 'My Workspace',
    roles: ['member'],
    permissions: [
      'workspace:read',
      'playground:use',
      'marketplace:install',
    ],
    ...overrides,
  };
}

export function tierMeetsRequirement(userTier: ModuleTier, requiredTier: ModuleTier): boolean {
  const rank: Record<ModuleTier, number> = {
    free: 0,
    professional: 1,
    power: 2,
    enterprise: 3,
  };
  return rank[userTier] >= rank[requiredTier];
}

export function userHasPermission(user: WorkspaceUser, permission: ModulePermission): boolean {
  return user.permissions.includes(permission) || user.roles.includes('admin');
}

/** Stub context factory for SSR / static export */
export function createWorkspaceContextStub(
  user?: WorkspaceUser,
  state?: Partial<WorkspaceState>,
): WorkspaceContextValue {
  const baseState = createDefaultWorkspaceState();
  return {
    user: user ?? createWorkspaceUser(),
    state: { ...baseState, ...state },
    setActiveModule: () => {},
    toggleSidebar: () => {},
  };
}
