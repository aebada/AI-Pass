/** Knowledge Graph — entity-relationship model for RAG & semantic grounding */

export type EntityType =
  | 'company'
  | 'person'
  | 'invoice'
  | 'product'
  | 'document'
  | 'policy'
  | 'other';

export interface GraphNode {
  id: string;
  label: string;
  type: EntityType;
  description?: string;
  /** Optional properties (ERP ids, emails, amounts, etc.) */
  properties?: Record<string, string | number | boolean>;
  /** Knowledge Pipeline source / chunk refs */
  knowledgeSourceIds?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  /** Relationship predicate, e.g. employs, issued, covers */
  predicate: string;
  label?: string;
  properties?: Record<string, string | number | boolean>;
  createdAt: string;
}

export interface GraphQuery {
  /** Filter nodes by entity type */
  type?: EntityType;
  /** Start node for neighbor / path queries */
  nodeId?: string;
  /** Max hops for neighbor expansion (default 1) */
  depth?: number;
  /** Filter edges by predicate */
  predicate?: string;
  /** Free-text match on node label */
  search?: string;
}

export interface GraphSnapshot {
  version: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
  updatedAt: string;
}

export interface NeighborResult {
  node: GraphNode;
  edge: GraphEdge;
  direction: 'out' | 'in';
}
