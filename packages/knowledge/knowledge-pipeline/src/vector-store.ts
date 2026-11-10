import { createId, type RetrievalIndex, type VectorStoreProvider } from '@ai-pass/shared';
import type { Embedding } from '@ai-pass/shared';

export interface VectorSearchResult {
  chunkId: string;
  score: number;
  embeddingId: string;
}

/** Pluggable vector store — FAISS in-memory default, external providers as stubs */
export class VectorStore {
  private provider: VectorStoreProvider;
  private indices = new Map<string, RetrievalIndex>();
  private vectors = new Map<string, { embeddingId: string; chunkId: string; vector: number[] }>();

  constructor(provider: VectorStoreProvider = 'faiss') {
    this.provider = provider;
  }

  getProvider(): VectorStoreProvider {
    return this.provider;
  }

  setProvider(provider: VectorStoreProvider): void {
    this.provider = provider;
  }

  createIndex(sourceId: string, dimension: number): RetrievalIndex {
    const index: RetrievalIndex = {
      id: `idx_${createId()}`,
      sourceId,
      provider: this.provider,
      chunkCount: 0,
      dimension,
      status: 'idle',
      lastIndexedAt: undefined,
    };
    this.indices.set(index.id, index);
    return index;
  }

  upsert(embedding: Embedding, chunkId: string): void {
    this.vectors.set(embedding.id, {
      embeddingId: embedding.id,
      chunkId,
      vector: embedding.vector,
    });

    const index = [...this.indices.values()].find((i) => i.sourceId === embedding.sourceId);
    if (index) {
      index.chunkCount = this.countForSource(embedding.sourceId);
      index.status = 'indexed';
      index.lastIndexedAt = new Date().toISOString();
      this.indices.set(index.id, index);
    }
  }

  search(queryVector: number[], topK = 5, _sourceId?: string): VectorSearchResult[] {
    const candidates = [...this.vectors.values()].filter(() => true);
    const scored = candidates.map((c) => ({
      chunkId: c.chunkId,
      embeddingId: c.embeddingId,
      score: this.cosineSimilarity(queryVector, c.vector),
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  private countForSource(_sourceId: string): number {
    return [...this.vectors.values()].length;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const len = Math.min(a.length, b.length);
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < len; i++) {
      dot += a[i]! * b[i]!;
      normA += a[i]! * a[i]!;
      normB += b[i]! * b[i]!;
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
  }

  listIndices(): RetrievalIndex[] {
    return [...this.indices.values()];
  }

  listProviders(): { id: VectorStoreProvider; name: string; status: 'available' | 'stub' }[] {
    return [
      { id: 'faiss', name: 'FAISS (in-memory)', status: 'available' },
      { id: 'qdrant', name: 'Qdrant', status: 'stub' },
      { id: 'chromadb', name: 'ChromaDB', status: 'stub' },
      { id: 'pinecone', name: 'Pinecone', status: 'stub' },
      { id: 'weaviate', name: 'Weaviate', status: 'stub' },
    ];
  }
}
