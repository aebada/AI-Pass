import { jsonOk, jsonError, getDiscoveryHub } from '@/src/lib/discovery-api';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const hub = getDiscoveryHub();
  const idsParam = searchParams.get('ids');
  const a = searchParams.get('a');
  const b = searchParams.get('b');

  const ids = idsParam
    ? idsParam.split(',').map((s) => s.trim()).filter(Boolean)
    : a && b
      ? [a, b]
      : [];

  if (ids.length < 2) {
    return jsonError('Query params ids=a,b[,c] or a & b (tool IDs) are required', 'MISSING_PARAMS', 400);
  }

  const comparison = hub.compareMany(ids);
  if (!comparison) {
    return jsonError('Tools not found for comparison', 'NOT_FOUND', 404);
  }

  const tools = (comparison.toolIds ?? [comparison.toolAId, comparison.toolBId])
    .map((id) => hub.discovery.getTool(id))
    .filter(Boolean);

  return jsonOk({
    comparison,
    tools,
    toolA: tools[0],
    toolB: tools[1],
  });
}
