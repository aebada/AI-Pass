import type { RAGRequest, RAGResponse } from '@ai-pass/shared';
import type { GraphService } from './graph-service.js';
import type { MetadataService } from './metadata-service.js';
import type { RetrievalService } from './retrieval-service.js';

/** Unified RAG API for agents — context, chunks, metadata, citations, graph links */
export class RAGService {
  constructor(
    private retrieval: RetrievalService,
    private metadata: MetadataService,
    private graph: GraphService,
  ) {}

  query(params: RAGRequest): RAGResponse {
    const results = this.retrieval.query({
      query: params.query,
      sourceIds: params.sourceIds,
      topK: params.topK ?? 5,
      mode: params.mode ?? 'hybrid',
      filters: params.filters,
      tenantId: params.tenantId,
      expandContext: true,
      hybrid: true,
    });

    const citations = results.map((r) => r.citation ?? `kp://${r.sourceId}/${r.chunkId}`);
    const metaList = results
      .map((r) => this.metadata.getByDocument(String(r.metadata.documentId ?? '')))
      .filter(Boolean) as import('@ai-pass/shared').Metadata[];

    const avgScore = results.length
      ? results.reduce((s, r) => s + r.score, 0) / results.length
      : 0;

    const graphLinks: RAGResponse['graphLinks'] = [];
    if (params.includeGraph !== false) {
      for (const r of results.slice(0, 3)) {
        const entities = this.graph.listEntities().filter(
          (e) => r.content.toLowerCase().includes(e.name.toLowerCase())
        );
        for (const e of entities.slice(0, 2)) {
          graphLinks.push({ entityId: e.id, name: e.name, type: e.type });
        }
      }
    }

    return {
      chunks: results.map((r) => ({
        ...r,
        graphLinks: graphLinks.filter((g) => r.content.includes(g.name)).map((g) => g.entityId),
      })),
      metadata: metaList,
      citations,
      confidence: Math.min(avgScore, 1),
      graphLinks,
      creditsUsed: Math.ceil(params.query.length / 50) + results.length,
    };
  }

  /** Agent Studio context retrieval entry point */
  retrieveContext(params: {
    agentId?: string;
    tenantId: string;
    query: string;
    sourceIds?: string[];
    topK?: number;
  }): RAGResponse {
    return this.query({
      query: params.query,
      tenantId: params.tenantId,
      sourceIds: params.sourceIds,
      topK: params.topK ?? 5,
      includeGraph: true,
    });
  }
}
