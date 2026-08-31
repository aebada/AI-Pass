import { createId } from '@ai-pass/shared';
import type { Application, Version } from './types.js';

export class AppRegistry {
  private apps = new Map<string, Application>();
  private versions = new Map<string, Version[]>();

  register(app: Omit<Application, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Application {
    const now = new Date().toISOString();
    const entry: Application = {
      ...app,
      id: app.id ?? `app_${createId()}`,
      createdAt: now,
      updatedAt: now,
    };
    this.apps.set(entry.id, entry);
    return entry;
  }

  get(id: string): Application | undefined {
    return this.apps.get(id);
  }

  getBySlug(slug: string): Application | undefined {
    return [...this.apps.values()].find((a) => a.slug === slug);
  }

  list(): Application[] {
    return [...this.apps.values()];
  }

  update(id: string, patch: Partial<Application>): Application | undefined {
    const existing = this.apps.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    this.apps.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.apps.delete(id);
  }

  publishVersion(appId: string, version: string, changelog?: string): Version {
    const entry: Version = {
      id: `ver_${createId()}`,
      resourceType: 'app',
      resourceId: appId,
      version,
      changelog,
      publishedAt: new Date().toISOString(),
      status: 'published',
    };
    const versions = this.versions.get(appId) ?? [];
    versions.push(entry);
    this.versions.set(appId, versions);
    this.update(appId, { version });
    return entry;
  }

  getVersions(appId: string): Version[] {
    return this.versions.get(appId) ?? [];
  }
}
