/** Prefer @ai-pass/workspace-rbac WorkspaceRole for new code. */
export type TenantRole =
  | 'owner'
  | 'admin'
  | 'manager'
  | 'member'
  | 'viewer'
  | 'auditor'
  /** @deprecated Migrated to builders group — see @ai-pass/workspace-rbac */
  | 'builder';

export interface TenantRbacPolicy {
  tenantId: string;
  roles: Record<TenantRole, string[]>;
  defaultRole: TenantRole;
}

export interface TenantMember {
  userId: string;
  tenantId: string;
  email: string;
  name: string;
  roles: TenantRole[];
  invitedAt: string;
  lastActiveAt?: string;
}

export const DEFAULT_RBAC: TenantRbacPolicy = {
  tenantId: 'default',
  defaultRole: 'viewer',
  roles: {
    owner: ['*'],
    admin: ['workspace:*', 'agents:*', 'settings:*', 'wallet:*', 'billing:*', 'connectors:*', 'it_security:*'],
    manager: ['workspace:*', 'members:manage', 'groups:manage', 'analytics:read', 'audit:read'],
    member: ['workspace:read', 'workspace:write', 'playground:use', 'agents:run'],
    viewer: ['workspace:read', 'playground:use'],
    auditor: ['workspace:read', 'trust:audit', 'compliance:approve', 'audit:read'],
    /** @deprecated Use builders group capabilities instead */
    builder: ['workspace:read', 'workspace:write', 'agents:run', 'playground:use', 'agents:create', 'skills:create'],
  },
};

export function memberHasPermission(member: TenantMember, permission: string): boolean {
  if (member.roles.includes('owner') || member.roles.includes('admin')) return true;
  const policy = DEFAULT_RBAC;
  return member.roles.some((role) => {
    const perms = policy.roles[role] ?? [];
    return perms.some(
      (p) => p === '*' || p === permission || p.endsWith(':*') && permission.startsWith(p.slice(0, -1)),
    );
  });
}
