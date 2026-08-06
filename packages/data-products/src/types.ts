/** Data Products — managed, versioned, owned datasets as products */

export type DataProductStatus = 'draft' | 'published' | 'deprecated' | 'retired';
export type ContractStatus = 'draft' | 'active' | 'violated' | 'expired';
export type QualityDimension = 'completeness' | 'accuracy' | 'timeliness' | 'consistency' | 'uniqueness';

export interface Owner {
  id: string;
  name: string;
  email?: string;
  team?: string;
  role?: 'owner' | 'steward' | 'consumer';
}

export interface SchemaField {
  name: string;
  type: string;
  nullable?: boolean;
  description?: string;
  primaryKey?: boolean;
}

export interface Schema {
  id: string;
  version: string;
  fields: SchemaField[];
  description?: string;
}

export interface QualityScore {
  overall: number;
  dimensions: Partial<Record<QualityDimension, number>>;
  checkedAt: string;
  notes?: string;
}

export interface DataContract {
  id: string;
  name: string;
  status: ContractStatus;
  /** SLA / expectations stub */
  expectations: string[];
  schemaVersion?: string;
  freshnessSlaHours?: number;
  qualityThreshold?: number;
  consumerIds?: string[];
  updatedAt: string;
}

/** Lightweight lineage stub — upstream/downstream product ids */
export interface LineageStub {
  upstreamProductIds: string[];
  downstreamProductIds: string[];
  knowledgePipelineIds?: string[];
  semanticModelIds?: string[];
}

export interface DataProduct {
  id: string;
  name: string;
  description: string;
  status: DataProductStatus;
  version: string;
  domain?: string;
  owners: Owner[];
  schema: Schema;
  quality: QualityScore;
  contracts: DataContract[];
  lineage: LineageStub;
  tags?: string[];
  /** Optional dataset URI / connector stub */
  sourceUri?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DataProductCatalogSnapshot {
  version: number;
  products: DataProduct[];
  updatedAt: string;
}
