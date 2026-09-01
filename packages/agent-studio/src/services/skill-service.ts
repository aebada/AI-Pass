import { createId, DEFAULT_SKILL_AVAILABILITY } from '@ai-pass/shared';
import type { SkillAvailability, SkillGovernanceActor } from '@ai-pass/shared';
import type { SkillRegistry } from '@ai-pass/marketplace-core';
import type { Skill, SkillType, SkillVersion } from '../types.js';
import type { SkillGovernanceService } from './skill-governance-service.js';

export class SkillService {
  private skills = new Map<string, Skill>();
  private versions = new Map<string, SkillVersion[]>();
  private governance?: SkillGovernanceService;

  constructor(private marketplaceRegistry?: SkillRegistry) {}

  /** Wire workspace skill permission / visibility policy. */
  setGovernance(governance: SkillGovernanceService): void {
    this.governance = governance;
  }

  register(
    skill: Omit<Skill, 'id' | 'createdAt' | 'updatedAt' | 'availability' | 'editorIds'> & {
      id?: string;
      availability?: SkillAvailability;
      editorIds?: string[];
      createdBy?: string;
    },
  ): Skill {
    const now = new Date().toISOString();
    const createdBy = skill.createdBy;
    const entry: Skill = {
      ...skill,
      id: skill.id ?? `skill_${createId()}`,
      availability: skill.availability ?? DEFAULT_SKILL_AVAILABILITY,
      editorIds: skill.editorIds ?? (createdBy ? [createdBy] : []),
      createdBy,
      createdAt: now,
      updatedAt: now,
    };
    this.skills.set(entry.id, entry);
    return entry;
  }

  get(skillId: string): Skill | undefined {
    const local = this.skills.get(skillId);
    if (local) return this.normalize(local);
    return this.resolveMarketplaceSkill(skillId);
  }

  list(filter?: { skillType?: SkillType; category?: string }): Skill[] {
    let all = [...this.skills.values()].map((s) => this.normalize(s));
    if (filter?.skillType) all = all.filter((s) => s.skillType === filter.skillType);
    if (filter?.category) all = all.filter((s) => s.category === filter.category);
    return all;
  }

  /**
   * Skills visible to a member (library, input bar, agent builder).
   * Admins see editors_only skills as well.
   */
  listForMember(actor: SkillGovernanceActor, filter?: { skillType?: SkillType; category?: string }): Skill[] {
    const all = this.listAll(filter);
    if (!this.governance) return all;
    return this.governance.filterVisible(all, actor);
  }

  /**
   * Skills agents may auto-discover (Members and Agents availability).
   */
  listDiscoverableForAgents(filter?: { skillType?: SkillType; category?: string }): Skill[] {
    const all = this.listAll(filter);
    if (!this.governance) {
      return all.filter((s) => s.availability === 'members_and_agents');
    }
    return this.governance.filterDiscoverableForAgents(all);
  }

  update(skillId: string, patch: Partial<Skill>): Skill | undefined {
    const existing = this.skills.get(skillId);
    if (!existing) return undefined;
    const updated = this.normalize({
      ...existing,
      ...patch,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    });
    this.skills.set(skillId, updated);
    return updated;
  }

  setAvailability(
    skillId: string,
    availability: SkillAvailability,
    actor: SkillGovernanceActor,
  ): Skill {
    const skill = this.skills.get(skillId);
    if (!skill) throw new Error(`Skill not found: ${skillId}`);
    this.governance?.assertCanChangeAvailability(actor, this.normalize(skill));
    const updated = this.update(skillId, { availability });
    if (!updated) throw new Error(`Skill not found: ${skillId}`);
    return updated;
  }

  publishVersion(skillId: string, version: string, changelog?: string): SkillVersion {
    const skill = this.skills.get(skillId);
    if (!skill) throw new Error(`Skill not found: ${skillId}`);
    const entry: SkillVersion = {
      id: `skver_${createId()}`,
      skillId,
      version,
      inputSchema: skill.inputSchema,
      outputSchema: skill.outputSchema,
      creditCost: skill.creditCost,
      changelog,
      publishedAt: new Date().toISOString(),
    };
    const versions = this.versions.get(skillId) ?? [];
    versions.push(entry);
    this.versions.set(skillId, versions);
    this.update(skillId, { version });
    return entry;
  }

  getVersions(skillId: string): SkillVersion[] {
    return this.versions.get(skillId) ?? [];
  }

  estimateCredits(skillId: string): number {
    return this.get(skillId)?.creditCost ?? 10;
  }

  /** Merge studio skills with marketplace registry (migrates missing availability). */
  listAll(filter?: { skillType?: SkillType; category?: string }): Skill[] {
    const studio = this.list(filter);
    if (!this.marketplaceRegistry) return studio;
    const ids = new Set(studio.map((s) => s.id));
    for (const mp of this.marketplaceRegistry.list()) {
      if (!ids.has(mp.id)) {
        if (filter?.category && mp.category !== filter.category) continue;
        studio.push(this.fromMarketplace(mp));
      }
    }
    return studio;
  }

  private normalize(skill: Skill): Skill {
    return {
      ...skill,
      availability: skill.availability ?? DEFAULT_SKILL_AVAILABILITY,
      editorIds: skill.editorIds ?? (skill.createdBy ? [skill.createdBy] : []),
    };
  }

  private fromMarketplace(mp: {
    id: string;
    name: string;
    slug: string;
    category: string;
    description: string;
    inputSchema?: Record<string, unknown>;
    outputSchema?: Record<string, unknown>;
    creditCost?: number;
    permissions?: string[];
    riskLevel?: Skill['riskLevel'];
    version?: string;
    certified?: boolean;
    createdAt: string;
    updatedAt: string;
  }): Skill {
    return {
      id: mp.id,
      name: mp.name,
      slug: mp.slug,
      skillType: 'Custom',
      category: mp.category,
      description: mp.description,
      inputSchema: mp.inputSchema ?? {},
      outputSchema: mp.outputSchema ?? {},
      creditCost: mp.creditCost ?? 10,
      permissions: mp.permissions ?? [],
      riskLevel: mp.riskLevel ?? 'medium',
      version: mp.version ?? '1.0.0',
      marketplaceSkillId: mp.id,
      certified: mp.certified,
      availability: DEFAULT_SKILL_AVAILABILITY,
      editorIds: [],
      createdAt: mp.createdAt,
      updatedAt: mp.updatedAt,
    };
  }

  private resolveMarketplaceSkill(skillId: string): Skill | undefined {
    const mp = this.marketplaceRegistry?.get(skillId);
    if (!mp) return undefined;
    return this.fromMarketplace(mp);
  }
}
