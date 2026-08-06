import { jsonOk, jsonError, getKnowledge, parseTenantId } from '@/src/lib/knowledge-api';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as {
      name?: string;
      type?: string;
      connector?: string;
      connectorKind?: string;
      embeddingModel?: string;
      accessRoles?: string[];
    };

    if (!body.name || !body.connector) {
      return jsonError('name and connector required');
    }

    const kp = getKnowledge();
    const source = kp.connectors.addSource({
      name: body.name,
      type: (body.type as 'file') ?? 'file',
      connector: body.connector,
      connectorKind: body.connectorKind as import('@ai-pass/shared').ConnectorKind | undefined,
      tenantId: parseTenantId(request),
      embeddingModel: body.embeddingModel,
      accessRoles: body.accessRoles,
    });

    kp.governance.recordLineage({
      entityType: 'source',
      entityId: source.id,
      action: 'created',
      parentIds: [],
    });

    return jsonOk(source, 201);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Failed to create source');
  }
}

export async function GET(request: Request): Promise<Response> {
  const kp = getKnowledge();
  const tenantId = parseTenantId(request);
  return jsonOk(kp.connectors.listSources(tenantId));
}
