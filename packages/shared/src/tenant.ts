export type TenantRole = 'owner' | 'admin' | 'builder' | 'viewer' | 'auditor';

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
    admin: [
      'workspace:*',
      'agents:*',
      'settings:*',
      'wallet:*',
      'skills:create',
      'skills:manage_availability',
      'skills:view_all',
    ],
    builder: [
      'workspace:read',
      'workspace:write',
      'agents:run',
      'playground:use',
      'skills:create',
      'skills:edit',
    ],
    viewer: ['workspace:read', 'playground:use', 'skills:use'],
    auditor: ['workspace:read', 'trust:audit', 'compliance:approve', 'skills:view_all'],
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
