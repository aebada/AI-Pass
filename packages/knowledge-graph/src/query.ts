import type { EntityType, GraphEdge, GraphNode, GraphQuery, GraphSnapshot, NeighborResult } from './types.js';

/** Direct neighbors of a node (1 hop). */
export function getNeighbors(
  snapshot: GraphSnapshot,
  nodeId: string,
  predicate?: string,
): NeighborResult[] {
  const byId = new Map(snapshot.nodes.map((n) => [n.id, n]));
  const results: NeighborResult[] = [];

  for (const edge of snapshot.edges) {
    if (predicate && edge.predicate !== predicate) continue;
    if (edge.sourceId === nodeId) {
      const node = byId.get(edge.targetId);
      if (node) results.push({ node, edge, direction: 'out' });
    } else if (edge.targetId === nodeId) {
      const node = byId.get(edge.sourceId);
      if (node) results.push({ node, edge, direction: 'in' });
    }
  }

  return results;
}

/** Nodes filtered by entity type. */
export function getNodesByType(snapshot: GraphSnapshot, type: EntityType): GraphNode[] {
  return snapshot.nodes.filter((n) => n.type === type);
}

/** Edges filtered by predicate. */
export function getEdgesByPredicate(snapshot: GraphSnapshot, predicate: string): GraphEdge[] {
  return snapshot.edges.filter((e) => e.predicate === predicate);
}

/** Expand neighborhood up to `depth` hops (BFS). */
export function expandNeighbors(
  snapshot: GraphSnapshot,
  nodeId: string,
  depth = 1,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodeMap = new Map(snapshot.nodes.map((n) => [n.id, n]));
  if (!nodeMap.has(nodeId)) return { nodes: [], edges: [] };

  const visited = new Set<string>([nodeId]);
  const edgeIds = new Set<string>();
  let frontier = [nodeId];

  for (let hop = 0; hop < depth; hop++) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const { node, edge } of getNeighbors(snapshot, id)) {
        edgeIds.add(edge.id);
        if (!visited.has(node.id)) {
          visited.add(node.id);
          next.push(node.id);
        }
      }
    }
    frontier = next;
  }

  return {
    nodes: [...visited].map((id) => nodeMap.get(id)!).filter(Boolean),
    edges: snapshot.edges.filter((e) => edgeIds.has(e.id)),
  };
}

/** Run a simple graph query against a snapshot. */
export function queryGraph(snapshot: GraphSnapshot, query: GraphQuery = {}): GraphSnapshot {
  let nodes = [...snapshot.nodes];
  let edges = [...snapshot.edges];

  if (query.type) {
    nodes = nodes.filter((n) => n.type === query.type);
  }

  if (query.search?.trim()) {
    const q = query.search.trim().toLowerCase();
    nodes = nodes.filter(
      (n) =>
        n.label.toLowerCase().includes(q) ||
        n.description?.toLowerCase().includes(q) ||
        n.tags?.some((t) => t.toLowerCase().includes(q)),
    );
  }

  if (query.nodeId) {
    const expanded = expandNeighbors(snapshot, query.nodeId, query.depth ?? 1);
    const allowed = new Set(expanded.nodes.map((n) => n.id));
    if (query.type || query.search) {
      nodes = nodes.filter((n) => allowed.has(n.id));
    } else {
      nodes = expanded.nodes;
    }
    edges = expanded.edges;
  }

  if (query.predicate) {
    edges = edges.filter((e) => e.predicate === query.predicate);
  }

  const nodeIds = new Set(nodes.map((n) => n.id));
  edges = edges.filter((e) => nodeIds.has(e.sourceId) && nodeIds.has(e.targetId));

  return {
    version: snapshot.version,
    nodes,
    edges,
    updatedAt: snapshot.updatedAt,
  };
}

export function countByType(snapshot: GraphSnapshot): Record<EntityType, number> {
  const counts: Partial<Record<EntityType, number>> = {};
  for (const n of snapshot.nodes) {
    counts[n.type] = (counts[n.type] ?? 0) + 1;
  }
  return counts as Record<EntityType, number>;
}
