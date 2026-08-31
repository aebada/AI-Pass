import { createId } from '@ai-pass/shared';
import type { Skill, Version, MarketplaceSkillCategory } from './types.js';

export class SkillRegistry {
  private skills = new Map<string, Skill>();
  private versions = new Map<string, Version[]>();

  register(
    skill: Omit<Skill, 'id' | 'createdAt' | 'updatedAt' | 'permissions' | 'compatibleModels' | 'dependencies'> &
      Partial<Pick<Skill, 'permissions' | 'compatibleModels' | 'dependencies'>> & { id?: string },
  ): Skill {
    const now = new Date().toISOString();
    const models = skill.modelsUsed ?? skill.compatibleModels ?? [];
    const entry: Skill = {
      ...skill,
      id: skill.id ?? `skill_${createId()}`,
      permissions: skill.permissions ?? ['wallet.deduct'],
      compatibleModels: skill.compatibleModels ?? models,
      dependencies: skill.dependencies ?? [],
      modelsUsed: models,
      createdAt: now,
      updatedAt: now,
    };
    this.skills.set(entry.id, entry);
    return entry;
  }

  get(skillId: string): Skill | undefined {
    return this.skills.get(skillId);
  }

  getBySlug(slug: string): Skill | undefined {
    return [...this.skills.values()].find((s) => s.slug === slug);
  }

  list(category?: MarketplaceSkillCategory): Skill[] {
    const all = [...this.skills.values()];
    return category ? all.filter((s) => s.category === category) : all;
  }

  update(skillId: string, patch: Partial<Skill>): Skill | undefined {
    const existing = this.skills.get(skillId);
    if (!existing) return undefined;
    const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    this.skills.set(skillId, updated);
    return updated;
  }

  publishVersion(skillId: string, version: string, changelog?: string): Version {
    const entry: Version = {
      id: `ver_${createId()}`,
      resourceType: 'skill',
      resourceId: skillId,
      version,
      changelog,
      publishedAt: new Date().toISOString(),
      status: 'published',
    };
    const versions = this.versions.get(skillId) ?? [];
    versions.push(entry);
    this.versions.set(skillId, versions);
    this.update(skillId, { version, lifecycleStatus: 'published' });
    return entry;
  }

  getVersions(skillId: string): Version[] {
    return this.versions.get(skillId) ?? [];
  }
}
