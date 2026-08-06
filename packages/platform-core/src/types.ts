/** AI Pass Platform — unified module and workspace types */

export type ModuleStatus = 'done' | 'stub' | 'pending';

export type ModuleTier = 'free' | 'professional' | 'power' | 'enterprise';

export type ModuleCategory =
  | 'core'
  | 'ai'
  | 'platform'
  | 'marketplace'
  | 'vertical'
  | 'infrastructure';

export type ModulePermission =
  | 'workspace:read'
  | 'workspace:write'
  | 'agents:run'
  | 'agents:configure'
  | 'workflows:run'
  | 'knowledge:read'
  | 'knowledge:write'
  | 'marketplace:install'
  | 'trust:audit'
  | 'compliance:approve'
  | 'governance:admin'
  | 'wallet:spend'
  | 'settings:admin'
  | 'playground:use'
  | 'providers:configure'
  | 'members:manage'
  | 'groups:manage';

export interface PlatformModuleDef {
  id: string;
  name: string;
  description: string;
  route: string;
  legacyRoute?: string;
  icon: string;
  category: ModuleCategory;
  tier: ModuleTier;
  status: ModuleStatus;
  permissions: ModulePermission[];
  dependencies: string[];
  navOrder: number;
  showInNav: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  route: string;
  icon: string;
  badge?: string;
  children?: NavItem[];
}

export interface WorkspaceUser {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  plan: ModuleTier;
  workspace: string;
  roles: string[];
  permissions: ModulePermission[];
}

export interface WorkspaceState {
  activeModuleId: string | null;
  sidebarCollapsed: boolean;
  theme: 'dark' | 'light' | 'system';
}

export interface WorkspaceContextValue {
  user: WorkspaceUser | null;
  state: WorkspaceState;
  setActiveModule: (moduleId: string) => void;
  toggleSidebar: () => void;
}
