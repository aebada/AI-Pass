export type {
  EntityType,
  GraphEdge,
  GraphNode,
  GraphQuery,
  GraphSnapshot,
  NeighborResult,
} from './types.js';

export { DEMO_EDGES, DEMO_NODES, createDemoSnapshot } from './seed.js';

export {
  KNOWLEDGE_GRAPH_STORAGE_KEY,
  InMemoryKnowledgeGraph,
  LocalStorageKnowledgeGraph,
  getKnowledgeGraph,
  resetKnowledgeGraphStore,
  countByType,
  expandNeighbors,
  getEdgesByPredicate,
  getNeighbors,
  getNodesByType,
  queryGraph,
} from './catalog.js';
export type { KnowledgeGraphStore } from './catalog.js';
