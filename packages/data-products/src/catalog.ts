import { createDemoCatalog } from './seed.js';
import type { DataProduct, DataProductCatalogSnapshot } from './types.js';

export const DATA_PRODUCTS_STORAGE_KEY = 'ai-pass-data-products-catalog';

export interface DataProductRepository {
  load(): DataProductCatalogSnapshot;
  save(snapshot: DataProductCatalogSnapshot): void;
  list(filter?: { status?: DataProduct['status']; domain?: string }): DataProduct[];
  get(id: string): DataProduct | undefined;
  upsert(product: DataProduct): DataProduct;
  delete(id: string): boolean;
  resetToDemo(): DataProductCatalogSnapshot;
}

function readStorage(): DataProductCatalogSnapshot | null {
  if (typeof globalThis.localStorage === 'undefined') return null;
  try {
    const raw = globalThis.localStorage.getItem(DATA_PRODUCTS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DataProductCatalogSnapshot;
  } catch {
    return null;
  }
}

function writeStorage(snapshot: DataProductCatalogSnapshot): void {
  if (typeof globalThis.localStorage === 'undefined') return;
  globalThis.localStorage.setItem(DATA_PRODUCTS_STORAGE_KEY, JSON.stringify(snapshot));
}

export class InMemoryDataProductRepository implements DataProductRepository {
  private snapshot: DataProductCatalogSnapshot;

  constructor(initial?: DataProductCatalogSnapshot) {
    this.snapshot = initial ?? createDemoCatalog();
  }

  load(): DataProductCatalogSnapshot {
    return structuredClone(this.snapshot);
  }

  save(snapshot: DataProductCatalogSnapshot): void {
    this.snapshot = { ...snapshot, updatedAt: new Date().toISOString() };
  }

  list(filter?: { status?: DataProduct['status']; domain?: string }): DataProduct[] {
    let products = [...this.snapshot.products];
    if (filter?.status) products = products.filter((p) => p.status === filter.status);
    if (filter?.domain) products = products.filter((p) => p.domain === filter.domain);
    return products;
  }

  get(id: string): DataProduct | undefined {
    return this.snapshot.products.find((p) => p.id === id);
  }

  upsert(product: DataProduct): DataProduct {
    const products = [...this.snapshot.products];
    const idx = products.findIndex((p) => p.id === product.id);
    const next = { ...product, updatedAt: new Date().toISOString() };
    if (idx >= 0) products[idx] = next;
    else products.push(next);
    this.save({ ...this.snapshot, products });
    return next;
  }

  delete(id: string): boolean {
    const before = this.snapshot.products.length;
    const products = this.snapshot.products.filter((p) => p.id !== id);
    this.save({ ...this.snapshot, products });
    return products.length < before;
  }

  resetToDemo(): DataProductCatalogSnapshot {
    const demo = createDemoCatalog();
    this.save(demo);
    return this.load();
  }
}

export class LocalStorageDataProductRepository implements DataProductRepository {
  private memory = new InMemoryDataProductRepository();

  private hydrate(): void {
    const stored = readStorage();
    if (stored) {
      this.memory.save(stored);
    } else {
      const demo = createDemoCatalog();
      this.memory.save(demo);
      writeStorage(demo);
    }
  }

  load(): DataProductCatalogSnapshot {
    this.hydrate();
    return this.memory.load();
  }

  save(snapshot: DataProductCatalogSnapshot): void {
    this.memory.save(snapshot);
    writeStorage(this.memory.load());
  }

  list(filter?: { status?: DataProduct['status']; domain?: string }): DataProduct[] {
    this.hydrate();
    return this.memory.list(filter);
  }

  get(id: string): DataProduct | undefined {
    this.hydrate();
    return this.memory.get(id);
  }

  upsert(product: DataProduct): DataProduct {
    this.hydrate();
    const next = this.memory.upsert(product);
    writeStorage(this.memory.load());
    return next;
  }

  delete(id: string): boolean {
    this.hydrate();
    const ok = this.memory.delete(id);
    writeStorage(this.memory.load());
    return ok;
  }

  resetToDemo(): DataProductCatalogSnapshot {
    const demo = this.memory.resetToDemo();
    writeStorage(demo);
    return demo;
  }
}

let defaultRepo: DataProductRepository | null = null;

export function getDataProductRepository(): DataProductRepository {
  if (!defaultRepo) {
    defaultRepo =
      typeof globalThis.localStorage !== 'undefined'
        ? new LocalStorageDataProductRepository()
        : new InMemoryDataProductRepository();
  }
  return defaultRepo;
}

export function resetDataProductRepository(): void {
  defaultRepo = null;
}

export function createProductId(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  return `dp_${slug || 'product'}_${Date.now().toString(36)}`;
}

export function createDraftProduct(input: {
  name: string;
  description: string;
  domain?: string;
  ownerName?: string;
}): DataProduct {
  const now = new Date().toISOString();
  const id = createProductId(input.name);
  return {
    id,
    name: input.name,
    description: input.description,
    status: 'draft',
    version: '0.1.0',
    domain: input.domain,
    owners: [
      {
        id: `own_${Date.now().toString(36)}`,
        name: input.ownerName ?? 'Unassigned',
        role: 'owner',
      },
    ],
    schema: {
      id: `sch_${id}`,
      version: '0.1.0',
      fields: [{ name: 'id', type: 'string', primaryKey: true }],
    },
    quality: {
      overall: 0,
      dimensions: {},
      checkedAt: now,
      notes: 'Not yet scored',
    },
    contracts: [],
    lineage: { upstreamProductIds: [], downstreamProductIds: [] },
    tags: ['draft'],
    createdAt: now,
    updatedAt: now,
  };
}
