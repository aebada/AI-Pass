import { createId, type Embedding, type KnowledgeChunk } from '@ai-pass/shared';

export type EmbeddingProvider = 'openai' | 'gemini' | 'huggingface' | 'local';

export interface EmbedParams {
  sourceId: string;
  content: string;
  metadata?: Record<string, unknown>;
  documentId?: string;
  model?: string;
  provider?: EmbeddingProvider;
}

/** Embedding generation and storage via provider-hub stubs */
export class EmbeddingService {
  private chunks = new Map<string, KnowledgeChunk>();
  private embeddings = new Map<string, Embedding>();
  private defaultModel = 'text-embedding-3-small';
  private dimensions = 8;

  indexContent(sourceId: string, content: string, metadata: Record<string, unknown> = {}): KnowledgeChunk {
    return this.embed({ sourceId, content, metadata });
  }

  embed(params: EmbedParams): KnowledgeChunk {
    const vector = this.generateVector(params.content, params.provider ?? 'openai');
    const embeddingId = `emb_${createId()}`;
    const chunkId = `chk_${createId()}`;

    const embedding: Embedding = {
      id: embeddingId,
      chunkId,
      sourceId: params.sourceId,
      model: params.model ?? this.defaultModel,
      dimensions: vector.length,
      vector,
      confidence: 0.88,
      metadata: { provider: params.provider ?? 'openai', ...params.metadata },
      createdAt: new Date().toISOString(),
    };

    const chunk: KnowledgeChunk = {
      id: chunkId,
      sourceId: params.sourceId,
      documentId: params.documentId,
      content: params.content,
      metadata: params.metadata ?? {},
      embeddingId,
      tokenCount: Math.ceil(params.content.length / 4),
      confidence: embedding.confidence,
      createdAt: new Date().toISOString(),
    };

    this.chunks.set(chunkId, chunk);
    this.embeddings.set(embeddingId, embedding);
    return chunk;
  }

  private generateVector(text: string, provider: EmbeddingProvider): number[] {
    const hash = text.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const providerOffset = { openai: 1, gemini: 2, huggingface: 3, local: 4 }[provider];
    return Array.from({ length: this.dimensions }, (_, i) =>
      Math.sin((hash + providerOffset) * (i + 1)) * 0.5 + 0.5
    );
  }

  getChunk(chunkId: string): KnowledgeChunk | undefined {
    return this.chunks.get(chunkId);
  }

  getEmbedding(embeddingId: string): Embedding | undefined {
    return this.embeddings.get(embeddingId);
  }

  getChunks(sourceId?: string): KnowledgeChunk[] {
    const all = [...this.chunks.values()];
    return sourceId ? all.filter((c) => c.sourceId === sourceId) : all;
  }

  getEmbeddings(sourceId?: string): Embedding[] {
    const all = [...this.embeddings.values()];
    return sourceId ? all.filter((e) => e.sourceId === sourceId) : all;
  }

  count(): number {
    return this.embeddings.size;
  }

  listProviders(): { id: EmbeddingProvider; name: string; status: 'available' | 'stub' }[] {
    return [
      { id: 'openai', name: 'OpenAI', status: 'stub' },
      { id: 'gemini', name: 'Google Gemini', status: 'stub' },
      { id: 'huggingface', name: 'HuggingFace', status: 'stub' },
      { id: 'local', name: 'Local Model', status: 'available' },
    ];
  }
}
