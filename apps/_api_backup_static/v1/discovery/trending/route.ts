import { jsonOk, getDiscoveryHub } from '@/src/lib/discovery-api';

export const runtime = 'nodejs';

export async function GET(): Promise<Response> {
  const hub = getDiscoveryHub();
  return jsonOk({
    scores: hub.trending.getTrendingScores(),
    tools: hub.trending.getTrendingTools(),
  });
}
