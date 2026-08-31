import type { MarketplaceCorePlatform } from '@ai-pass/marketplace-core';
import type { Collection, Tool } from './types.js';
import { appsToTools } from './mappers.js';
import { DISCOVERY_COLLECTIONS } from './seed-data.js';

export class CollectionsService {
  private collections = DISCOVERY_COLLECTIONS;

  constructor(private platform: MarketplaceCorePlatform) {}

  list(): Collection[] {
    return this.collections;
  }

  get(slug: string): Collection | undefined {
    return this.collections.find((c) => c.slug === slug);
  }

  getTools(slug: string): Tool[] {
    const collection = this.get(slug);
    if (!collection) return [];
    const apps = collection.toolIds
      .map((id) => this.platform.apps.get(id))
      .filter((a): a is NonNullable<typeof a> => a !== undefined);
    return appsToTools(apps, this.platform);
  }

  /** Admin-editable stub — returns updated collection in memory */
  update(slug: string, patch: Partial<Pick<Collection, 'name' | 'description' | 'toolIds'>>): Collection | undefined {
    const idx = this.collections.findIndex((c) => c.slug === slug);
    if (idx < 0) return undefined;
    this.collections[idx] = { ...this.collections[idx], ...patch, editable: true };
    return this.collections[idx];
  }
}
