import { jsonOk, jsonError, getKnowledge, parseTenantId } from '@/src/lib/knowledge-api';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as {
      query?: string;
      sourceIds?: string[];
      topK?: number;
      mode?: string;
      includeGraph?: boolean;
      filters?: Record<string, unknown>;
    };

    if (!body.query) {
      return jsonError('query required');
    }

    const kp = getKnowledge();
    const result = kp.rag.query({
      query: body.query,
      tenantId: parseTenantId(request),
      sourceIds: body.sourceIds,
      topK: body.topK,
      mode: body.mode as import('@ai-pass/shared').RetrievalMode | undefined,
      includeGraph: body.includeGraph,
      filters: body.filters,
    });

    return jsonOk(result);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Query failed');
  }
}
