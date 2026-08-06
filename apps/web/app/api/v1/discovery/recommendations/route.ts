import { jsonOk, getDiscoveryHub } from '@/src/lib/discovery-api';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as {
    toolId?: string;
    userId?: string;
    type?: 'similar' | 'alternative' | 'competitor' | 'personalized';
    limit?: number;
  };

  const hub = getDiscoveryHub();
  const limit = body.limit ?? 6;

  if (body.type === 'personalized' || (!body.toolId && body.userId)) {
    const recs = hub.recommendations.personalized(body.userId ?? 'demo-user', limit);
    return jsonOk({
      recommendations: recs,
      tools: hub.recommendations.resolveTools(recs),
    });
  }

  if (!body.toolId) {
    const recs = hub.recommendations.personalized('demo-user', limit);
    return jsonOk({
      recommendations: recs,
      tools: hub.recommendations.resolveTools(recs),
    });
  }

  let recommendations;
  switch (body.type) {
    case 'alternative':
      recommendations = hub.recommendations.alternatives(body.toolId, limit);
      break;
    case 'competitor':
      recommendations = hub.recommendations.competitors(body.toolId, limit);
      break;
    case 'similar':
    default:
      recommendations = hub.recommendations.similar(body.toolId, limit);
  }

  return jsonOk({
    recommendations,
    tools: hub.recommendations.resolveTools(recommendations),
  });
}
