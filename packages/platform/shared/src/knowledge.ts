/** Knowledge Pipeline — enterprise knowledge infrastructure types */

export type KnowledgeSourceType =
  | 'file'
  | 'database'
  | 'api'
  | 'enterprise_system'
  | 'stream';

export type SyncStatus = 'idle' | 'syncing' | 'indexed' | 'failed';

export type ConnectorKind =
  | 'pdf' | 'docx' | 'txt' | 'html' | 'csv' | 'excel' | 'json' | 'xml'
  | 'postgres' | 'mysql' | 'sqlserver' | 'oracle' | 'mongodb' | 'snowflake' | 'bigquery'
  | 'sap' | 'salesforce' | 'servicenow' | 'sharepoint' | 'confluence' | 'jira' | 'm365' | 'google'
  | 'rest' | 'graphql' | 'webhook'
  | 'kafka' | 'mqtt' | 'livesync';

export type PipelineStage =
  | 'connect'
  | 'validate'
  | 'clean'
  | 'normalize'
  | 'extract_metadata'
  | 'extract_entities'
  | 'relationships'
  | 'chunk'
  | 'embed'
  | 'index'
  | 'publish'
  | 'sync';

export type VectorStoreProvider = 'faiss' | 'qdrant' | 'chromadb' | 'pinecone' | 'weaviate';

export type RetrievalMode = 'semantic' | 'keyword' | 'hybrid' | 'graph';

export type DataClassification = 'public' | 'internal' | 'confidential' | 'restricted' | 'pii';

export interface KnowledgeSource {
  id: string;
  name: string;
  type: KnowledgeSourceType;
  connector: string;
  connectorKind?: ConnectorKind;
  tenantId: string;
  syncStatus: SyncStatus;
  lastSyncedAt?: string;
  chunkCount: number;
  documentCount?: number;
  embeddingModel: string;
  accessRoles: string[];
  ownerId?: string;
  trustScore?: number;
  createdAt: string;
}

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  sourceId: string;
  tenantId: string;
  stages: PipelineStage[];
  templateId?: string;
  status: 'draft' | 'active' | 'paused' | 'failed';
  lastRunAt?: string;
  createdAt: string;
}

export interface Document {
  id: string;
  sourceId: string;
  title: string;
  content: string;
  mimeType?: string;
  metadata: Record<string, unknown>;
  version: number;
  classification?: DataClassification;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeChunk {
  id: string;
  sourceId: string;
  documentId?: string;
  content: string;
  metadata: Record<string, unknown>;
  embeddingId?: string;
  tokenCount?: number;
  confidence?: number;
  createdAt: string;
}

export interface Embedding {
  id: string;
  chunkId: string;
  sourceId: string;
  model: string;
  dimensions: number;
  vector: number[];
  confidence: number;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface SemanticEntity {
  id: string;
  name: string;
  type: string;
  properties: Record<string, unknown>;
  sourceId?: string;
  confidence?: number;
}

export interface Entity extends SemanticEntity {
  ontologyRef?: string;
  categories?: string[];
}

export interface RelationshipEdge {
  id: string;
  subjectId: string;
  predicate: string;
  objectId: string;
  confidence: number;
}

export interface Relationship extends RelationshipEdge {
  sourceId?: string;
  bidirectional?: boolean;
}

export interface KnowledgeGraph {
  id: string;
  tenantId: string;
  name: string;
  entityCount: number;
  edgeCount: number;
  ontology?: string;
  updatedAt: string;
}

export interface RetrievalIndex {
  id: string;
  sourceId: string;
  provider: VectorStoreProvider;
  chunkCount: number;
  dimension: number;
  status: SyncStatus;
  lastIndexedAt?: string;
}

export interface Metadata {
  id: string;
  documentId: string;
  entities: string[];
  concepts: string[];
  categories: string[];
  topics: string[];
  keywords: string[];
  businessObjects: string[];
  enrichedAt: string;
}

export interface RetrievalQuery {
  query: string;
  sourceIds?: string[];
  topK?: number;
  filters?: Record<string, unknown>;
  hybrid?: boolean;
  mode?: RetrievalMode;
  expandContext?: boolean;
  tenantId?: string;
}

export interface RetrievalResult {
  chunkId: string;
  content: string;
  score: number;
  sourceId: string;
  metadata: Record<string, unknown>;
  citation?: string;
  graphLinks?: string[];
}

export interface RAGRequest {
  query: string;
  tenantId: string;
  sourceIds?: string[];
  topK?: number;
  mode?: RetrievalMode;
  includeGraph?: boolean;
  filters?: Record<string, unknown>;
}

export interface RAGResponse {
  chunks: RetrievalResult[];
  metadata: Metadata[];
  citations: string[];
  confidence: number;
  graphLinks: { entityId: string; name: string; type: string }[];
  creditsUsed?: number;
}

export interface SyncEvent {
  id: string;
  sourceId: string;
  eventType: string;
  status: SyncStatus;
  chunksProcessed: number;
  timestamp: string;
}

export interface SynchronizationEvent extends SyncEvent {
  tenantId: string;
  documentsUpdated: number;
  embeddingsRefreshed: number;
  graphUpdated: boolean;
  agentsNotified: number;
}

export interface LineageRecord {
  id: string;
  entityType: 'source' | 'document' | 'chunk' | 'embedding' | 'entity';
  entityId: string;
  action: string;
  actorId?: string;
  parentIds: string[];
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface KnowledgeStatus {
  sources: number;
  activePipelines: number;
  documents: number;
  chunks: number;
  embeddings: number;
  graphEntities: number;
  graphEdges: number;
  syncEvents: number;
  retrievalLatencyMs: number;
  failures: number;
  storageBytes: number;
}

export interface GraphQuery {
  entityId?: string;
  predicate?: string;
  depth?: number;
  sparql?: string;
  tenantId?: string;
}

export interface GraphQueryResult {
  entities: Entity[];
  edges: Relationship[];
  paths?: string[][];
}
