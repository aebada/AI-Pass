import { createId, type StoreAppMetadata, type StoreSearchFilters } from '@ai-pass/shared';

export class AppRegistry {
  private apps = new Map<string, StoreAppMetadata>();

  register(app: Omit<StoreAppMetadata, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'installCount'> & { id?: string }): StoreAppMetadata {
    const now = new Date().toISOString();
    const entry: StoreAppMetadata = {
      ...app,
      id: app.id ?? `app_${createId()}`,
      rating: 0,
      installCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.apps.set(entry.id, entry);
    return entry;
  }

  get(appId: string): StoreAppMetadata | undefined {
    return this.apps.get(appId);
  }

  update(appId: string, patch: Partial<StoreAppMetadata>): StoreAppMetadata | undefined {
    const existing = this.apps.get(appId);
    if (!existing) return undefined;
    const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    this.apps.set(appId, updated);
    return updated;
  }

  list(): StoreAppMetadata[] {
    return [...this.apps.values()];
  }

  search(filters: StoreSearchFilters): StoreAppMetadata[] {
    return this.list().filter((app) => {
      if (filters.keyword && !app.name.toLowerCase().includes(filters.keyword.toLowerCase())) return false;
      if (filters.category && app.category !== filters.category) return false;
      if (filters.pricingModel && app.pricingModel !== filters.pricingModel) return false;
      if (filters.riskLevel && app.riskLevel !== filters.riskLevel) return false;
      if (filters.certified !== undefined && app.certified !== filters.certified) return false;
      if (filters.enterpriseReady !== undefined && app.enterpriseReady !== filters.enterpriseReady) return false;
      return true;
    });
  }

  featured(): StoreAppMetadata[] {
    return this.list().filter((a) => a.certified || a.enterpriseReady).slice(0, 10);
  }

  trending(): StoreAppMetadata[] {
    return [...this.apps.values()].sort((a, b) => b.installCount - a.installCount).slice(0, 10);
  }
}
