import type { RetrievalQuery, RetrievalResult } from '@ai-pass/shared';
import type { EmbeddingService } from './embedding-service.js';
import type { VectorStore } from './vector-store.js';

/** Retrieval — semantic, keyword, hybrid, metadata filter, context expansion */
export class RetrievalService {
  constructor(
    private embedding: EmbeddingService,
    private vectorStore: VectorStore,
  ) {}

  query(params: RetrievalQuery): RetrievalResult[] {
    const mode = params.mode ?? (params.hybrid ? 'hybrid' : 'semantic');
    const chunks = this.embedding.getChunks();
    let filtered = params.sourceIds
      ? chunks.filter((c) => params.sourceIds!.includes(c.sourceId))
      : chunks;

    if (params.filters) {
      filtered = filtered.filter((c) =>
        Object.entries(params.filters!).every(([k, v]) => c.metadata[k] === v)
      );
    }

    let scored: RetrievalResult[];

    switch (mode) {
      case 'keyword':
        scored = this.keywordSearch(params.query, filtered);
        break;
      case 'hybrid':
        scored = this.hybridSearch(params.query, filtered);
        break;
      case 'semantic':
      default:
        scored = this.semanticSearch(params.query, filtered);
        break;
    }

    const topK = params.topK ?? 5;
    let results = scored.sort((a, b) => b.score - a.score).slice(0, topK);

    if (params.expandContext) {
      results = this.expandContext(results, filtered);
    }

    return results.map((r) => ({
      ...r,
      citation: `kp://${r.sourceId}/${r.chunkId}`,
    }));
  }

  private semanticSearch(query: string, chunks: { id: string; sourceId: string; content: string; metadata: Record<string, unknown>; embeddingId?: string }[]): RetrievalResult[] {
    const queryVector = this.hashToVector(query);
    const vectorResults = this.vectorStore.search(queryVector, chunks.length);

    return chunks.map((chunk) => {
      const vr = vectorResults.find((v) => v.chunkId === chunk.id);
      const score = vr?.score ?? this.textSimilarity(query, chunk.content);
      return {
        chunkId: chunk.id,
        content: chunk.content,
        score,
        sourceId: chunk.sourceId,
        metadata: chunk.metadata,
      };
    });
  }

  private keywordSearch(query: string, chunks: { id: string; sourceId: string; content: string; metadata: Record<string, unknown> }[]): RetrievalResult[] {
    return chunks.map((chunk) => ({
      chunkId: chunk.id,
      content: chunk.content,
      score: this.textSimilarity(query, chunk.content),
      sourceId: chunk.sourceId,
      metadata: chunk.metadata,
    }));
  }

  private hybridSearch(query: string, chunks: { id: string; sourceId: string; content: string; metadata: Record<string, unknown>; embeddingId?: string }[]): RetrievalResult[] {
    const semantic = this.semanticSearch(query, chunks);
    const keyword = this.keywordSearch(query, chunks);
    const merged = new Map<string, RetrievalResult>();

    for (const r of semantic) {
      merged.set(r.chunkId, { ...r, score: r.score * 0.6 });
    }
    for (const r of keyword) {
      const existing = merged.get(r.chunkId);
      merged.set(r.chunkId, existing
        ? { ...existing, score: existing.score + r.score * 0.4 }
        : { ...r, score: r.score * 0.4 });
    }
    return [...merged.values()];
  }

  private expandContext(results: RetrievalResult[], allChunks: { id: string; sourceId: string; content: string; metadata: Record<string, unknown> }[]): RetrievalResult[] {
    const expanded = [...results];
    for (const r of results) {
      const neighbors = allChunks.filter(
        (c) => c.sourceId === r.sourceId && c.id !== r.chunkId
      ).slice(0, 1);
      for (const n of neighbors) {
        if (!expanded.find((e) => e.chunkId === n.id)) {
          expanded.push({
            chunkId: n.id,
            content: n.content,
            score: r.score * 0.5,
            sourceId: n.sourceId,
            metadata: { ...n.metadata, expanded: true },
          });
        }
      }
    }
    return expanded;
  }

  private textSimilarity(query: string, content: string): number {
    const qWords = new Set(query.toLowerCase().split(/\s+/));
    const cWords = content.toLowerCase().split(/\s+/);
    const overlap = cWords.filter((w) => qWords.has(w)).length;
    return overlap / Math.max(qWords.size, 1);
  }

  private hashToVector(text: string): number[] {
    const hash = text.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return Array.from({ length: 8 }, (_, i) => Math.sin(hash * (i + 1)) * 0.5 + 0.5);
  }
}
