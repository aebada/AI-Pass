import type { Capability, WorkspaceGroup, WorkspaceMember, WorkspaceRole } from './types.js';
import { ADMIN_ONLY_CAPABILITIES } from './capabilities.js';
import { ROLE_CAPABILITIES, roleGrantsAll } from './roles.js';

function expandRoleCapabilities(roles: WorkspaceRole[]): Set<Capability> {
  const out = new Set<Capability>();
  for (const role of roles) {
    if (roleGrantsAll(role)) {
      // Owners/admins get everything represented as a sentinel handled by can()
      return new Set(['*' as Capability]);
    }
    for (const cap of ROLE_CAPABILITIES[role] as Capability[]) {
      out.add(cap);
    }
  }
  return out;
}

export function resolveEffectiveCapabilities(
  member: WorkspaceMember,
  groups: WorkspaceGroup[],
): Capability[] {
  const fromRoles = expandRoleCapabilities(member.roles);
  if (fromRoles.has('*' as Capability)) {
    return ['*' as Capability];
  }

  const memberGroups = groups.filter((g) => g.memberIds.includes(member.userId));
  for (const group of memberGroups) {
    for (const cap of group.capabilities) {
      // Managers cannot gain admin-only caps via groups either
      if (
        member.roles.includes('manager') &&
        !member.roles.includes('admin') &&
        !member.roles.includes('owner') &&
        ADMIN_ONLY_CAPABILITIES.includes(cap)
      ) {
        continue;
      }
      fromRoles.add(cap);
    }
  }

  return Array.from(fromRoles);
}

export function can(
  member: WorkspaceMember,
  groups: WorkspaceGroup[],
  capability: Capability | string,
): boolean {
  if (member.status === 'deactivated') return false;
  if (member.roles.includes('owner') || member.roles.includes('admin')) return true;

  const effective = resolveEffectiveCapabilities(member, groups);
  if (effective.includes('*' as Capability)) return true;

  if (effective.includes(capability as Capability)) return true;

  // Prefix wildcard: agents:* matches agents:create
  const [ns] = capability.split(':');
  if (ns && effective.includes(`${ns}:*` as Capability)) return true;

  return false;
}

export function canManageSensitiveSettings(member: WorkspaceMember): boolean {
  return member.roles.includes('owner') || member.roles.includes('admin');
}

export function isManagerOnly(member: WorkspaceMember): boolean {
  return (
    member.roles.includes('manager') &&
    !member.roles.includes('admin') &&
    !member.roles.includes('owner')
  );
}
