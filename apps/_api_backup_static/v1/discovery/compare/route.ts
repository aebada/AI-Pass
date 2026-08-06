import { jsonOk, jsonError, getDiscoveryHub } from '@/src/lib/discovery-api';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const hub = getDiscoveryHub();
  const a = searchParams.get('a');
  const b = searchParams.get('b');

  if (!a || !b) {
    return jsonError('Query params a and b (tool IDs) are required', 'MISSING_PARAMS', 400);
  }

  const comparison = hub.compare(a, b);
  if (!comparison) {
    return jsonError('Tools not found for comparison', 'NOT_FOUND', 404);
  }

  const toolA = hub.discovery.getTool(a);
  const toolB = hub.discovery.getTool(b);

  return jsonOk({ comparison, toolA, toolB });
}
