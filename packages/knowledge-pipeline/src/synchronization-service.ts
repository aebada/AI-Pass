import { createId, type Document, type SyncEvent, type SynchronizationEvent } from '@ai-pass/shared';
import type { ConnectorService } from './connector-service.js';
import { DataCleaningService } from './data-cleaning.js';
import type { EmbeddingService } from './embedding-service.js';
import { GraphService } from './graph-service.js';
import { MetadataService } from './metadata-service.js';
import { VectorStore } from './vector-store.js';

export interface SyncParams {
  sourceId: string;
  force?: boolean;
  tenantId?: string;
  documentContent?: string;
  documentTitle?: string;
}

/** LiveSync integration — re-index, refresh embeddings, update graph, notify agents */
export class SynchronizationService {
  private events: SynchronizationEvent[] = [];
  private documents = new Map<string, Document>();
  private agentNotifications: { sourceId: string; timestamp: string }[] = [];

  constructor(
    private connectors: ConnectorService,
    private cleaning: DataCleaningService,
    private metadata: MetadataService,
    private embedding: EmbeddingService,
    private graph: GraphService,
    private vectorStore: VectorStore,
  ) {}

  async syncSource(params: SyncParams): Promise<SynchronizationEvent> {
    const source = this.connectors.getSource(params.sourceId);
    if (!source) throw new Error(`Source not found: ${params.sourceId}`);

    this.connectors.updateSyncStatus(params.sourceId, 'syncing');

    const event: SynchronizationEvent = {
      id: `sync_${createId()}`,
      sourceId: params.sourceId,
      tenantId: params.tenantId ?? source.tenantId,
      eventType: params.force ? 'force_sync' : 'scheduled_sync',
      status: 'syncing',
      chunksProcessed: 0,
      documentsUpdated: 0,
      embeddingsRefreshed: 0,
      graphUpdated: false,
      agentsNotified: 0,
      timestamp: new Date().toISOString(),
    };

    const content = params.documentContent ?? `Synced content from ${source.name}`;
    const doc: Document = {
      id: `doc_${createId()}`,
      sourceId: params.sourceId,
      title: params.documentTitle ?? source.name,
      content,
      metadata: { connector: source.connector, synced_at: event.timestamp },
      version: 1,
      createdAt: event.timestamp,
      updatedAt: event.timestamp,
    };

    const cleaned = this.cleaning.process(doc);
    this.documents.set(doc.id, cleaned.document);

    const meta = this.metadata.enrich(cleaned.document);
    const entities = this.metadata.extractEntities(cleaned.document.content, params.sourceId);
    for (const ent of entities) {
      this.graph.addEntity(ent);
    }

    const chunk = this.embedding.embed({
      sourceId: params.sourceId,
      content: cleaned.document.content,
      documentId: doc.id,
      metadata: { ...cleaned.document.metadata, metaId: meta.id },
    });

    const emb = this.embedding.getEmbedding(chunk.embeddingId!);
    if (emb) {
      this.vectorStore.upsert(emb, chunk.id);
      event.embeddingsRefreshed = 1;
    }

    event.chunksProcessed = 1;
    event.documentsUpdated = 1;
    event.graphUpdated = entities.length > 0;
    event.status = 'indexed';
    event.agentsNotified = this.notifyAgents(params.sourceId);

    this.connectors.updateSyncStatus(params.sourceId, 'indexed', source.chunkCount + 1);
    this.events.push(event);
    return event;
  }

  private notifyAgents(sourceId: string): number {
    this.agentNotifications.push({ sourceId, timestamp: new Date().toISOString() });
    return 1;
  }

  listEvents(sourceId?: string): SynchronizationEvent[] {
    return sourceId ? this.events.filter((e) => e.sourceId === sourceId) : [...this.events];
  }

  getDocuments(sourceId?: string): Document[] {
    const all = [...this.documents.values()];
    return sourceId ? all.filter((d) => d.sourceId === sourceId) : all;
  }

  /** Handle LiveSync knowledge.updated events */
  async onKnowledgeUpdated(params: {
    sourceId: string;
    eventType: string;
    payload: Record<string, unknown>;
  }): Promise<SynchronizationEvent> {
    return this.syncSource({
      sourceId: params.sourceId,
      force: true,
      documentContent: String(params.payload.content ?? params.payload.text ?? ''),
      documentTitle: String(params.payload.title ?? 'LiveSync update'),
    });
  }

  getAgentNotifications() {
    return [...this.agentNotifications];
  }
}

/** @deprecated Use SynchronizationService */
export class SyncService {
  private sync: SynchronizationService;

  constructor(ingestion: ConnectorService, embedding: EmbeddingService) {
    const cleaning = new DataCleaningService();
    const metadata = new MetadataService();
    const graph = new GraphService();
    const vectorStore = new VectorStore();
    this.sync = new SynchronizationService(ingestion, cleaning, metadata, embedding, graph, vectorStore);
  }

  syncSource(params: { sourceId: string; force?: boolean }): Promise<SyncEvent> {
    return this.sync.syncSource(params);
  }

  listEvents(sourceId?: string): SyncEvent[] {
    return this.sync.listEvents(sourceId);
  }
}
