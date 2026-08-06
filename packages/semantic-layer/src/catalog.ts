import { createDemoSnapshot } from './seed.js';
import type {
  Dimension,
  Entity,
  MetricDefinition,
  SemanticCatalogSnapshot,
  SemanticModel,
} from './types.js';

export const SEMANTIC_STORAGE_KEY = 'ai-pass-semantic-catalog';

export interface SemanticCatalogStore {
  load(): SemanticCatalogSnapshot;
  save(snapshot: SemanticCatalogSnapshot): void;
  listMetrics(): MetricDefinition[];
  listEntities(): Entity[];
  listDimensions(): Dimension[];
  listModels(): SemanticModel[];
  getMetric(id: string): MetricDefinition | undefined;
  upsertMetric(metric: MetricDefinition): MetricDefinition;
  deleteMetric(id: string): boolean;
  upsertEntity(entity: Entity): Entity;
  resetToDemo(): SemanticCatalogSnapshot;
}

function readStorage(): SemanticCatalogSnapshot | null {
  if (typeof globalThis.localStorage === 'undefined') return null;
  try {
    const raw = globalThis.localStorage.getItem(SEMANTIC_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SemanticCatalogSnapshot;
  } catch {
    return null;
  }
}

function writeStorage(snapshot: SemanticCatalogSnapshot): void {
  if (typeof globalThis.localStorage === 'undefined') return;
  globalThis.localStorage.setItem(SEMANTIC_STORAGE_KEY, JSON.stringify(snapshot));
}

/** In-memory catalog for tests and server-side bootstrap */
export class InMemorySemanticCatalog implements SemanticCatalogStore {
  private snapshot: SemanticCatalogSnapshot;

  constructor(initial?: SemanticCatalogSnapshot) {
    this.snapshot = initial ?? createDemoSnapshot();
  }

  load(): SemanticCatalogSnapshot {
    return structuredClone(this.snapshot);
  }

  save(snapshot: SemanticCatalogSnapshot): void {
    this.snapshot = {
      ...snapshot,
      updatedAt: new Date().toISOString(),
    };
  }

  listMetrics(): MetricDefinition[] {
    return [...this.snapshot.metrics];
  }

  listEntities(): Entity[] {
    return [...this.snapshot.entities];
  }

  listDimensions(): Dimension[] {
    return [...this.snapshot.dimensions];
  }

  listModels(): SemanticModel[] {
    return [...this.snapshot.models];
  }

  getMetric(id: string): MetricDefinition | undefined {
    return this.snapshot.metrics.find((m) => m.id === id);
  }

  upsertMetric(metric: MetricDefinition): MetricDefinition {
    const metrics = [...this.snapshot.metrics];
    const idx = metrics.findIndex((m) => m.id === metric.id);
    const next = { ...metric, updatedAt: new Date().toISOString() };
    if (idx >= 0) metrics[idx] = next;
    else metrics.push(next);
    this.save({ ...this.snapshot, metrics });
    return next;
  }

  deleteMetric(id: string): boolean {
    const before = this.snapshot.metrics.length;
    const metrics = this.snapshot.metrics.filter((m) => m.id !== id);
    this.save({ ...this.snapshot, metrics });
    return metrics.length < before;
  }

  upsertEntity(entity: Entity): Entity {
    const entities = [...this.snapshot.entities];
    const idx = entities.findIndex((e) => e.id === entity.id);
    const next = { ...entity, updatedAt: new Date().toISOString() };
    if (idx >= 0) entities[idx] = next;
    else entities.push(next);
    this.save({ ...this.snapshot, entities });
    return next;
  }

  resetToDemo(): SemanticCatalogSnapshot {
    const demo = createDemoSnapshot();
    this.save(demo);
    return this.load();
  }
}

/** Browser localStorage-backed catalog for workspace MVP */
export class LocalStorageSemanticCatalog implements SemanticCatalogStore {
  private memory = new InMemorySemanticCatalog();

  private hydrate(): void {
    const stored = readStorage();
    if (stored) {
      this.memory.save(stored);
    } else {
      const demo = createDemoSnapshot();
      this.memory.save(demo);
      writeStorage(demo);
    }
  }

  load(): SemanticCatalogSnapshot {
    this.hydrate();
    return this.memory.load();
  }

  save(snapshot: SemanticCatalogSnapshot): void {
    this.memory.save(snapshot);
    writeStorage(this.memory.load());
  }

  listMetrics(): MetricDefinition[] {
    this.hydrate();
    return this.memory.listMetrics();
  }

  listEntities(): Entity[] {
    this.hydrate();
    return this.memory.listEntities();
  }

  listDimensions(): Dimension[] {
    this.hydrate();
    return this.memory.listDimensions();
  }

  listModels(): SemanticModel[] {
    this.hydrate();
    return this.memory.listModels();
  }

  getMetric(id: string): MetricDefinition | undefined {
    this.hydrate();
    return this.memory.getMetric(id);
  }

  upsertMetric(metric: MetricDefinition): MetricDefinition {
    this.hydrate();
    const next = this.memory.upsertMetric(metric);
    writeStorage(this.memory.load());
    return next;
  }

  deleteMetric(id: string): boolean {
    this.hydrate();
    const ok = this.memory.deleteMetric(id);
    writeStorage(this.memory.load());
    return ok;
  }

  upsertEntity(entity: Entity): Entity {
    this.hydrate();
    const next = this.memory.upsertEntity(entity);
    writeStorage(this.memory.load());
    return next;
  }

  resetToDemo(): SemanticCatalogSnapshot {
    const demo = this.memory.resetToDemo();
    writeStorage(demo);
    return demo;
  }
}

let defaultCatalog: SemanticCatalogStore | null = null;

/** Prefer localStorage in browser; fall back to in-memory */
export function getSemanticCatalog(): SemanticCatalogStore {
  if (!defaultCatalog) {
    defaultCatalog =
      typeof globalThis.localStorage !== 'undefined'
        ? new LocalStorageSemanticCatalog()
        : new InMemorySemanticCatalog();
  }
  return defaultCatalog;
}

export function resetSemanticCatalog(): void {
  defaultCatalog = null;
}

export function createMetricId(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  return `met_${slug || 'metric'}_${Date.now().toString(36)}`;
}
