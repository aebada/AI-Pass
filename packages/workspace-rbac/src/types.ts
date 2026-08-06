/** Canonical workspace roles — Builder retired in favor of the builders group. */
export type WorkspaceRole =
  | 'owner'
  | 'admin'
  | 'manager'
  | 'member'
  | 'viewer'
  | 'auditor';

/** @deprecated Use the builders group + capabilities instead. */
export type LegacyBuilderRole = 'builder';

export type Capability =
  | 'workspace:read'
  | 'workspace:write'
  | 'playground:use'
  | 'agents:create'
  | 'agents:publish'
  | 'agents:run'
  | 'skills:create'
  | 'skills:publish'
  | 'frames:use'
  | 'audit:read'
  | 'settings:sensitive'
  | 'members:manage'
  | 'groups:manage'
  | 'analytics:read'
  | 'billing:manage'
  | 'connectors:manage'
  | 'it_security:manage'
  | 'wallet:spend'
  | 'trust:audit'
  | 'compliance:approve';

export type GroupSource = 'manual' | 'scim';

export interface CapabilityDefinition {
  id: Capability;
  label: string;
  description: string;
  /** If true, only owner/admin may hold this (not Manager). */
  adminOnly?: boolean;
  category: 'workspace' | 'agents' | 'governance' | 'admin' | 'sensitive';
}

export interface WorkspaceMember {
  userId: string;
  orgId: string;
  email: string;
  name: string;
  roles: WorkspaceRole[];
  /** Legacy builder flag — migrated into builders group. */
  legacyBuilder?: boolean;
  invitedAt: string;
  lastActiveAt?: string;
  status: 'active' | 'invited' | 'deactivated';
}

export interface WorkspaceGroup {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  description?: string;
  source: GroupSource;
  externalId?: string;
  capabilities: Capability[];
  memberIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ScimConfig {
  orgId: string;
  enabled: boolean;
  baseUrl: string;
  tokenHint?: string;
  lastSyncAt?: string;
  userCount?: number;
  groupCount?: number;
}

export interface GovernanceSnapshot {
  orgId: string;
  members: WorkspaceMember[];
  groups: WorkspaceGroup[];
  scim?: ScimConfig;
}
