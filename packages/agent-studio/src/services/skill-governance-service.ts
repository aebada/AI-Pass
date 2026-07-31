import {
  DEFAULT_SKILL_AVAILABILITY,
  DEFAULT_WORKSPACE_SKILL_PERMISSIONS,
  canChangeSkillAvailability,
  canCreateSkill,
  isSkillDiscoverableByAgents,
  isSkillVisibleToMember,
  type SkillAvailability,
  type SkillGovernanceActor,
  type WorkspaceSkillPermissions,
} from '@ai-pass/shared';
import type { Skill } from '../types.js';

const DEMO_WORKSPACE_ID = 'workspace_demo';

/**
 * Workspace-level skill create / availability policies + visibility helpers.
 */
export class SkillGovernanceService {
  private permissions: WorkspaceSkillPermissions = {
    workspaceId: DEMO_WORKSPACE_ID,
    ...DEFAULT_WORKSPACE_SKILL_PERMISSIONS,
    updatedAt: new Date().toISOString(),
  };

  getPermissions(workspaceId = DEMO_WORKSPACE_ID): WorkspaceSkillPermissions {
    return { ...this.permissions, workspaceId };
  }

  updatePermissions(
    patch: Partial<Pick<WorkspaceSkillPermissions, 'createSkills' | 'changeAvailability'>>,
    actor: SkillGovernanceActor,
    workspaceId = DEMO_WORKSPACE_ID,
  ): WorkspaceSkillPermissions {
    if (!actorIsAdminLocal(actor)) {
      throw new Error('Only admins can change workspace skill permissions.');
    }
    this.permissions = {
      ...this.permissions,
      ...patch,
      workspaceId,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.userId,
    };
    return this.getPermissions(workspaceId);
  }

  assertCanCreate(actor: SkillGovernanceActor): void {
    if (!canCreateSkill(actor, this.permissions.createSkills)) {
      throw new Error('You do not have permission to create skills in this workspace.');
    }
  }

  assertCanChangeAvailability(actor: SkillGovernanceActor, skill: Skill): void {
    const isEditor = skill.editorIds.includes(actor.userId) || skill.createdBy === actor.userId;
    if (!canChangeSkillAvailability(actor, this.permissions.changeAvailability, isEditor)) {
      throw new Error('You do not have permission to change this skill’s availability.');
    }
  }

  isEditor(skill: Skill, userId: string): boolean {
    return skill.editorIds.includes(userId) || skill.createdBy === userId;
  }

  filterVisible(skills: Skill[], actor: SkillGovernanceActor): Skill[] {
    return skills.filter((skill) =>
      isSkillVisibleToMember(skill.availability, actor, this.isEditor(skill, actor.userId)),
    );
  }

  filterDiscoverableForAgents(skills: Skill[]): Skill[] {
    return skills.filter((skill) => isSkillDiscoverableByAgents(skill.availability));
  }

  /** Normalize legacy skills missing availability → all_members (migration). */
  migrateSkillFields<T extends Partial<Skill>>(skill: T): T & {
    availability: SkillAvailability;
    editorIds: string[];
  } {
    return {
      ...skill,
      availability: skill.availability ?? DEFAULT_SKILL_AVAILABILITY,
      editorIds: skill.editorIds ?? (skill.createdBy ? [skill.createdBy] : []),
    };
  }
}

function actorIsAdminLocal(actor: SkillGovernanceActor): boolean {
  return Boolean(actor.isAdmin) || actor.roles.includes('owner') || actor.roles.includes('admin');
}
