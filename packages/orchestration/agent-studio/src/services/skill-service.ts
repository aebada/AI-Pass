import { createId } from '@ai-pass/shared';
import type { SkillRegistry } from '@ai-pass/marketplace-core';
import type { Skill, SkillType, SkillVersion } from '../types.js';

export class SkillService {
  private skills = new Map<string, Skill>();
  private versions = new Map<string, SkillVersion[]>();

  constructor(private marketplaceRegistry?: SkillRegistry) {}

  register(skill: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Skill {
    const now = new Date().toISOString();
    const entry: Skill = {
      ...skill,
      id: skill.id ?? `skill_${createId()}`,
      createdAt: now,
      updatedAt: now,
    };
    this.skills.set(entry.id, entry);
    return entry;
  }

  get(skillId: string): Skill | undefined {
    return this.skills.get(skillId) ?? this.resolveMarketplaceSkill(skillId);
  }

  list(filter?: { skillType?: SkillType; category?: string }): Skill[] {
    let all = [...this.skills.values()];
    if (filter?.skillType) all = all.filter((s) => s.skillType === filter.skillType);
    if (filter?.category) all = all.filter((s) => s.category === filter.category);
    return all;
  }

  update(skillId: string, patch: Partial<Skill>): Skill | undefined {
    const existing = this.skills.get(skillId);
    if (!existing) return undefined;
    const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    this.skills.set(skillId, updated);
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

  /** Merge studio skills with marketplace registry */
  listAll(): Skill[] {
    const studio = this.list();
    if (!this.marketplaceRegistry) return studio;
    const ids = new Set(studio.map((s) => s.id));
    for (const mp of this.marketplaceRegistry.list()) {
      if (!ids.has(mp.id)) {
        studio.push({
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
          createdAt: mp.createdAt,
          updatedAt: mp.updatedAt,
        });
      }
    }
    return studio;
  }

  private resolveMarketplaceSkill(skillId: string): Skill | undefined {
    const mp = this.marketplaceRegistry?.get(skillId);
    if (!mp) return undefined;
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
      createdAt: mp.createdAt,
      updatedAt: mp.updatedAt,
    };
  }
}
