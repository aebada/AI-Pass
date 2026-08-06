import { createDemoSnapshot } from './seed.js';
import {
  countByType,
  expandNeighbors,
  getEdgesByPredicate,
  getNeighbors,
  getNodesByType,
  queryGraph,
} from './query.js';
import type {
  EntityType,
  GraphEdge,
  GraphNode,
  GraphQuery,
  GraphSnapshot,
  NeighborResult,
} from './types.js';

export const KNOWLEDGE_GRAPH_STORAGE_KEY = 'ai-pass-knowledge-graph';

export interface KnowledgeGraphStore {
  load(): GraphSnapshot;
  save(snapshot: GraphSnapshot): void;
  listNodes(type?: EntityType): GraphNode[];
  listEdges(predicate?: string): GraphEdge[];
  getNode(id: string): GraphNode | undefined;
  upsertNode(node: GraphNode): GraphNode;
  upsertEdge(edge: GraphEdge): GraphEdge;
  neighbors(nodeId: string, predicate?: string): NeighborResult[];
  query(query?: GraphQuery): GraphSnapshot;
  resetToDemo(): GraphSnapshot;
}

function readStorage(): GraphSnapshot | null {
  if (typeof globalThis.localStorage === 'undefined') return null;
  try {
    const raw = globalThis.localStorage.getItem(KNOWLEDGE_GRAPH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GraphSnapshot;
  } catch {
    return null;
  }
}

function writeStorage(snapshot: GraphSnapshot): void {
  if (typeof globalThis.localStorage === 'undefined') return;
  globalThis.localStorage.setItem(KNOWLEDGE_GRAPH_STORAGE_KEY, JSON.stringify(snapshot));
}

export class InMemoryKnowledgeGraph implements KnowledgeGraphStore {
  private snapshot: GraphSnapshot;

  constructor(initial?: GraphSnapshot) {
    this.snapshot = initial ?? createDemoSnapshot();
  }

  load(): GraphSnapshot {
    return structuredClone(this.snapshot);
  }

  save(snapshot: GraphSnapshot): void {
    this.snapshot = { ...snapshot, updatedAt: new Date().toISOString() };
  }

  listNodes(type?: EntityType): GraphNode[] {
    return type ? getNodesByType(this.snapshot, type) : [...this.snapshot.nodes];
  }

  listEdges(predicate?: string): GraphEdge[] {
    return predicate
      ? getEdgesByPredicate(this.snapshot, predicate)
      : [...this.snapshot.edges];
  }

  getNode(id: string): GraphNode | undefined {
    return this.snapshot.nodes.find((n) => n.id === id);
  }

  upsertNode(node: GraphNode): GraphNode {
    const nodes = [...this.snapshot.nodes];
    const idx = nodes.findIndex((n) => n.id === node.id);
    const next = { ...node, updatedAt: new Date().toISOString() };
    if (idx >= 0) nodes[idx] = next;
    else nodes.push(next);
    this.save({ ...this.snapshot, nodes });
    return next;
  }

  upsertEdge(edge: GraphEdge): GraphEdge {
    const edges = [...this.snapshot.edges];
    const idx = edges.findIndex((e) => e.id === edge.id);
    if (idx >= 0) edges[idx] = edge;
    else edges.push(edge);
    this.save({ ...this.snapshot, edges });
    return edge;
  }

  neighbors(nodeId: string, predicate?: string): NeighborResult[] {
    return getNeighbors(this.snapshot, nodeId, predicate);
  }

  query(query?: GraphQuery): GraphSnapshot {
    return queryGraph(this.snapshot, query ?? {});
  }

  resetToDemo(): GraphSnapshot {
    const demo = createDemoSnapshot();
    this.save(demo);
    return this.load();
  }
}

export class LocalStorageKnowledgeGraph implements KnowledgeGraphStore {
  private memory = new InMemoryKnowledgeGraph();

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

  load(): GraphSnapshot {
    this.hydrate();
    return this.memory.load();
  }

  save(snapshot: GraphSnapshot): void {
    this.memory.save(snapshot);
    writeStorage(this.memory.load());
  }

  listNodes(type?: EntityType): GraphNode[] {
    this.hydrate();
    return this.memory.listNodes(type);
  }

  listEdges(predicate?: string): GraphEdge[] {
    this.hydrate();
    return this.memory.listEdges(predicate);
  }

  getNode(id: string): GraphNode | undefined {
    this.hydrate();
    return this.memory.getNode(id);
  }

  upsertNode(node: GraphNode): GraphNode {
    this.hydrate();
    const next = this.memory.upsertNode(node);
    writeStorage(this.memory.load());
    return next;
  }

  upsertEdge(edge: GraphEdge): GraphEdge {
    this.hydrate();
    const next = this.memory.upsertEdge(edge);
    writeStorage(this.memory.load());
    return next;
  }

  neighbors(nodeId: string, predicate?: string): NeighborResult[] {
    this.hydrate();
    return this.memory.neighbors(nodeId, predicate);
  }

  query(query?: GraphQuery): GraphSnapshot {
    this.hydrate();
    return this.memory.query(query);
  }

  resetToDemo(): GraphSnapshot {
    const demo = this.memory.resetToDemo();
    writeStorage(demo);
    return demo;
  }
}

let defaultStore: KnowledgeGraphStore | null = null;

export function getKnowledgeGraph(): KnowledgeGraphStore {
  if (!defaultStore) {
    defaultStore =
      typeof globalThis.localStorage !== 'undefined'
        ? new LocalStorageKnowledgeGraph()
        : new InMemoryKnowledgeGraph();
  }
  return defaultStore;
}

export function resetKnowledgeGraphStore(): void {
  defaultStore = null;
}

export {
  countByType,
  expandNeighbors,
  getEdgesByPredicate,
  getNeighbors,
  getNodesByType,
  queryGraph,
};
