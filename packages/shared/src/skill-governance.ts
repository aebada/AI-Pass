/**
 * Workspace skill visibility & management controls.
 *
 * Availability governs discoverability (not Space/Pod access).
 * Permissions separately control who may create skills and who may
 * change a skill's availability.
 */

import type { TenantRole } from './tenant.js';

/** Skill availability states (visibility / discoverability). */
export type SkillAvailability =
  /** Limited to skill editors while developing/testing. Still usable if attached to an agent/skill. */
  | 'editors_only'
  /** Visible to all workspace members (input bar, agent builder, skill library). */
  | 'all_members'
  /** Visible to members and automatically discoverable by agents. */
  | 'members_and_agents';

export const SKILL_AVAILABILITY_OPTIONS: ReadonlyArray<{
  id: SkillAvailability;
  label: string;
  description: string;
}> = [
  {
    id: 'editors_only',
    label: 'Editors only',
    description:
      'Keep a skill limited to its editors while you develop or test it. Other users can still use it indirectly when the skill is included in an agent or another skill.',
  },
  {
    id: 'all_members',
    label: 'All members',
    description:
      'Make a skill visible to everyone in your workspace. Members can find it through the input bar and agent builder.',
  },
  {
    id: 'members_and_agents',
    label: 'Members and Agents',
    description:
      'Make a skill available to workspace members and to agents to be discovered. Agents can find and activate the skill automatically when it matches a task.',
  },
];

/** Default for migrated / existing skills — keeps prior visibility unchanged. */
export const DEFAULT_SKILL_AVAILABILITY: SkillAvailability = 'all_members';

/** Who may create new workspace skills. */
export type SkillCreatePolicy = 'admins' | 'admins_and_builders' | 'all_members';

/** Who may change a skill's availability setting. */
export type SkillAvailabilityChangePolicy =
  | 'admins'
  | 'admins_and_editors'
  | 'editors';

export interface WorkspaceSkillPermissions {
  workspaceId: string;
  /** Who can create skills in this workspace. */
  createSkills: SkillCreatePolicy;
  /** Who can change skill availability. */
  changeAvailability: SkillAvailabilityChangePolicy;
  updatedAt: string;
  updatedBy?: string;
}

export const DEFAULT_WORKSPACE_SKILL_PERMISSIONS: Omit<
  WorkspaceSkillPermissions,
  'workspaceId' | 'updatedAt' | 'updatedBy'
> = {
  createSkills: 'admins_and_builders',
  changeAvailability: 'admins_and_editors',
};

export interface SkillGovernanceActor {
  userId: string;
  roles: TenantRole[];
  /** When true, bypasses editors_only visibility (admins see all skills). */
  isAdmin?: boolean;
}

export function actorIsAdmin(actor: SkillGovernanceActor): boolean {
  if (actor.isAdmin) return true;
  return actor.roles.includes('owner') || actor.roles.includes('admin');
}

export function actorIsBuilder(actor: SkillGovernanceActor): boolean {
  return actorIsAdmin(actor) || actor.roles.includes('builder');
}

export function canCreateSkill(
  actor: SkillGovernanceActor,
  policy: SkillCreatePolicy,
): boolean {
  switch (policy) {
    case 'admins':
      return actorIsAdmin(actor);
    case 'admins_and_builders':
      return actorIsBuilder(actor);
    case 'all_members':
      return true;
    default:
      return false;
  }
}

export function canChangeSkillAvailability(
  actor: SkillGovernanceActor,
  policy: SkillAvailabilityChangePolicy,
  isEditor: boolean,
): boolean {
  switch (policy) {
    case 'admins':
      return actorIsAdmin(actor);
    case 'admins_and_editors':
      return actorIsAdmin(actor) || isEditor;
    case 'editors':
      return isEditor || actorIsAdmin(actor);
    default:
      return false;
  }
}

/**
 * Whether a skill is visible to a workspace member in catalogs / pickers.
 * Admins see all skills. Editors always see their own editors_only skills.
 * Indirect use via agent attachment is allowed even when not listed.
 */
export function isSkillVisibleToMember(
  availability: SkillAvailability,
  actor: SkillGovernanceActor,
  isEditor: boolean,
): boolean {
  if (actorIsAdmin(actor) || isEditor) return true;
  return availability === 'all_members' || availability === 'members_and_agents';
}

/** Whether agents may auto-discover and activate this skill. */
export function isSkillDiscoverableByAgents(availability: SkillAvailability): boolean {
  return availability === 'members_and_agents';
}

export function skillAvailabilityLabel(availability: SkillAvailability): string {
  return SKILL_AVAILABILITY_OPTIONS.find((o) => o.id === availability)?.label ?? availability;
}
