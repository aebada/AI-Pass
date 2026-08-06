import { BUILDER_EQUIVALENT_CAPABILITIES } from './roles.js';
import type { WorkspaceGroup, WorkspaceMember } from './types.js';

export const BUILDERS_GROUP_SLUG = 'builders';

export function createBuildersGroup(orgId: string, memberIds: string[] = []): WorkspaceGroup {
  const now = new Date().toISOString();
  return {
    id: `grp_builders_${orgId}`,
    orgId,
    name: 'Builders',
    slug: BUILDERS_GROUP_SLUG,
    description:
      'Former Builder role holders. Create and publish agents and skills with Frames access. Review in People → Groups.',
    source: 'manual',
    capabilities: [...BUILDER_EQUIVALENT_CAPABILITIES],
    memberIds: [...memberIds],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Move legacy builder role holders into the builders group.
 * Strips deprecated builder markers; leaves other roles intact.
 */
export function migrateBuildersToGroup(
  members: WorkspaceMember[],
  groups: WorkspaceGroup[],
  orgId: string,
): { members: WorkspaceMember[]; groups: WorkspaceGroup[]; migratedUserIds: string[] } {
  const builderIds = members
    .filter((m) => m.legacyBuilder || (m as { roles: string[] }).roles.includes('builder' as never))
    .map((m) => m.userId);

  const cleanedMembers: WorkspaceMember[] = members.map((m) => {
    const roles = (m.roles as string[]).filter((r) => r !== 'builder') as WorkspaceMember['roles'];
    return {
      ...m,
      roles: roles.length ? roles : (['member'] as WorkspaceMember['roles']),
      legacyBuilder: false,
    };
  });

  let builders = groups.find((g) => g.slug === BUILDERS_GROUP_SLUG && g.orgId === orgId);
  const others = groups.filter((g) => !(g.slug === BUILDERS_GROUP_SLUG && g.orgId === orgId));

  if (!builders) {
    builders = createBuildersGroup(orgId, builderIds);
  } else {
    const merged = new Set([...builders.memberIds, ...builderIds]);
    builders = {
      ...builders,
      memberIds: Array.from(merged),
      capabilities: builders.capabilities.length
        ? builders.capabilities
        : [...BUILDER_EQUIVALENT_CAPABILITIES],
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    members: cleanedMembers,
    groups: [...others, builders],
    migratedUserIds: builderIds,
  };
}
