/** Semantic Layer — governed business meaning for agents & analytics */

export type MetricStatus = 'draft' | 'certified' | 'deprecated';
export type MetricAggregation = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'ratio' | 'custom';
export type EntityKind = 'business' | 'dimensional' | 'reference';

export interface Dimension {
  id: string;
  name: string;
  description?: string;
  /** Source field or expression (stub — not a warehouse dialect) */
  expression?: string;
  dataType?: 'string' | 'number' | 'boolean' | 'date' | 'timestamp';
  entityId?: string;
}

export interface Entity {
  id: string;
  name: string;
  description?: string;
  kind: EntityKind;
  primaryKey?: string;
  dimensions: string[];
  /** Optional knowledge source / corpus ids */
  knowledgeSourceIds?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MetricDefinition {
  id: string;
  name: string;
  /** Business-friendly display label */
  label: string;
  description: string;
  /** SQL/expression stub or natural-language formula */
  formula: string;
  aggregation: MetricAggregation;
  status: MetricStatus;
  /** Entity this metric belongs to */
  entityId?: string;
  dimensions: string[];
  unit?: string;
  owner?: string;
  tags?: string[];
  /** Links to knowledge docs that define the metric */
  knowledgeRefIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SemanticModel {
  id: string;
  name: string;
  description?: string;
  version: string;
  entityIds: string[];
  metricIds: string[];
  dimensionIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SemanticCatalogSnapshot {
  version: number;
  entities: Entity[];
  dimensions: Dimension[];
  metrics: MetricDefinition[];
  models: SemanticModel[];
  updatedAt: string;
}
