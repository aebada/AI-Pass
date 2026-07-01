import type { KnowledgeStatus } from '@ai-pass/shared';
import { ConnectorService } from './connector-service.js';
import { DataCleaningService } from './data-cleaning.js';
import { EmbeddingService } from './embedding-service.js';
import { GovernanceService } from './governance-service.js';
import { GraphService } from './graph-service.js';
import { MetadataService } from './metadata-service.js';
import { PipelineService } from './pipeline-service.js';
import { PublishingService } from './publishing-service.js';
import { RAGService } from './rag-service.js';
import { RetrievalService } from './retrieval-service.js';
import { SynchronizationService } from './synchronization-service.js';
import { VectorStore } from './vector-store.js';
import { seedKnowledgePlatform } from './seed-data.js';

export interface KnowledgePlatformOptions {
  seed?: boolean;
  vectorProvider?: import('@ai-pass/shared').VectorStoreProvider;
}

/** Enterprise knowledge infrastructure — single source of truth for AI context */
export class KnowledgePlatform {
  readonly connectors = new ConnectorService();
  readonly pipelines = new PipelineService();
  readonly cleaning = new DataCleaningService();
  readonly metadata = new MetadataService();
  readonly embeddings = new EmbeddingService();
  readonly graph = new GraphService();
  readonly vectorStore: VectorStore;
  readonly retrieval: RetrievalService;
  readonly rag: RAGService;
  readonly sync: SynchronizationService;
  readonly publishing: PublishingService;
  readonly governance = new GovernanceService();

  /** @deprecated Use connectors */
  readonly ingestion = this.connectors;

  constructor(options: KnowledgePlatformOptions = { seed: true }) {
    this.vectorStore = new VectorStore(options.vectorProvider ?? 'faiss');
    this.retrieval = new RetrievalService(this.embeddings, this.vectorStore);
    this.rag = new RAGService(this.retrieval, this.metadata, this.graph);
    this.sync = new SynchronizationService(
      this.connectors,
      this.cleaning,
      this.metadata,
      this.embeddings,
      this.graph,
      this.vectorStore,
    );
    this.publishing = new PublishingService(this.rag);

    if (options.seed !== false) {
      seedKnowledgePlatform(this);
    }
  }

  getStatus(): KnowledgeStatus {
    const sources = this.connectors.listSources();
    const pipelines = this.pipelines.list();
    const graphStats = this.graph.getStats();

    return {
      sources: sources.length,
      activePipelines: pipelines.filter((p) => p.status === 'active').length,
      documents: this.sync.getDocuments().length,
      chunks: this.embeddings.getChunks().length,
      embeddings: this.embeddings.count(),
      graphEntities: graphStats.entityCount,
      graphEdges: graphStats.edgeCount,
      syncEvents: this.sync.listEvents().length,
      retrievalLatencyMs: 42,
      failures: sources.filter((s) => s.syncStatus === 'failed').length,
      storageBytes: this.embeddings.getChunks().length * 2048,
    };
  }
}

let defaultPlatform: KnowledgePlatform | null = null;

export function getKnowledgePlatform(options?: KnowledgePlatformOptions): KnowledgePlatform {
  if (!defaultPlatform) {
    defaultPlatform = new KnowledgePlatform(options);
  }
  return defaultPlatform;
}

export function resetKnowledgePlatform(): void {
  defaultPlatform = null;
}

export function createKnowledgePipeline(options?: KnowledgePlatformOptions) {
  const platform = getKnowledgePlatform(options);
  return {
    ...platform,
    ingestion: platform.connectors,
    embedding: platform.embeddings,
    retrieval: platform.retrieval,
    graph: platform.graph,
    sync: platform.sync,
    hook: new KnowledgePipelineHook(platform),
  };
}

/** LiveSync integration hook */
export class KnowledgePipelineHook {
  constructor(private platform: KnowledgePlatform) {}

  async onDataIngested(params: {
    sourceId: string;
    eventType: string;
    payload: Record<string, unknown>;
  }): Promise<import('@ai-pass/shared').SynchronizationEvent> {
    return this.platform.sync.onKnowledgeUpdated(params);
  }

  syncSource(params: { sourceId: string; force?: boolean }): Promise<import('@ai-pass/shared').SynchronizationEvent> {
    return this.platform.sync.syncSource(params);
  }
}
