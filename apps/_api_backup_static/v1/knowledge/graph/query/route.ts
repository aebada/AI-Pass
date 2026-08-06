import { jsonOk, jsonError, getKnowledge, parseTenantId } from '@/src/lib/knowledge-api';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as {
      entityId?: string;
      predicate?: string;
      depth?: number;
      sparql?: string;
    };

    const kp = getKnowledge();
    const result = kp.graph.query({
      entityId: body.entityId,
      predicate: body.predicate,
      depth: body.depth,
      sparql: body.sparql,
      tenantId: parseTenantId(request),
    });

    return jsonOk(result);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Graph query failed');
  }
}
