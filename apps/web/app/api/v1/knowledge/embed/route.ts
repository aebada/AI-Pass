import { jsonOk, jsonError, getKnowledge } from '@/src/lib/knowledge-api';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as {
      sourceId?: string;
      content?: string;
      metadata?: Record<string, unknown>;
      documentId?: string;
    };

    if (!body.sourceId || !body.content) {
      return jsonError('sourceId and content required');
    }

    const kp = getKnowledge();
    const chunk = kp.embeddings.embed({
      sourceId: body.sourceId,
      content: body.content,
      metadata: body.metadata,
      documentId: body.documentId,
    });

    const emb = kp.embeddings.getEmbedding(chunk.embeddingId!);
    if (emb) kp.vectorStore.upsert(emb, chunk.id);

    return jsonOk({ chunk, embeddingId: chunk.embeddingId });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Failed to embed content');
  }
}
