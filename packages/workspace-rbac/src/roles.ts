import type { Capability, WorkspaceRole } from './types.js';
import { ADMIN_ONLY_CAPABILITIES } from './capabilities.js';

/** Baseline capabilities granted by workspace role (before group union). */
export const ROLE_CAPABILITIES: Record<WorkspaceRole, Capability[] | ['*']> = {
  owner: ['*'],
  admin: ['*'],
  manager: [
    'workspace:read',
    'workspace:write',
    'playground:use',
    'agents:run',
    'frames:use',
    'members:manage',
    'groups:manage',
    'analytics:read',
    'audit:read',
  ],
  member: ['workspace:read', 'workspace:write', 'playground:use', 'agents:run', 'frames:use'],
  viewer: ['workspace:read', 'playground:use'],
  auditor: ['workspace:read', 'audit:read', 'trust:audit', 'compliance:approve', 'analytics:read'],
};

export const ROLE_LABELS: Record<WorkspaceRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  manager: 'Manager',
  member: 'Member',
  viewer: 'Viewer',
  auditor: 'Auditor',
};

export const ROLE_DESCRIPTIONS: Record<WorkspaceRole, string> = {
  owner: 'Full control of the organization, including ownership transfer.',
  admin:
    'Full workspace administration including billing, connectors, and IT & Security.',
  manager:
    'Day-to-day workspace administration: members, groups, and analytics. Cannot manage billing, connectors, or IT & Security.',
  member: 'Standard workspace access.',
  viewer: 'Read-only access.',
  auditor: 'Audit logs, trust, and compliance review.',
};

/** Former Builder role capabilities — now assigned via the builders group. */
export const BUILDER_EQUIVALENT_CAPABILITIES: Capability[] = [
  'workspace:read',
  'workspace:write',
  'playground:use',
  'agents:create',
  'agents:publish',
  'agents:run',
  'skills:create',
  'skills:publish',
  'frames:use',
];

export function roleGrantsAll(role: WorkspaceRole): boolean {
  return ROLE_CAPABILITIES[role][0] === '*';
}

export function isSensitiveCapability(cap: Capability): boolean {
  return ADMIN_ONLY_CAPABILITIES.includes(cap);
}
