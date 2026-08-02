import { jsonOk, jsonError, getDiscoveryHub } from '@/src/lib/discovery-api';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const hub = getDiscoveryHub();
  const toolId = searchParams.get('tool') ?? searchParams.get('id');

  if (!toolId) {
    const tools = hub.discovery.listTools().slice(0, 20);
    const leaderboard = tools
      .map((t) => ({
        tool: t,
        benchmark: hub.benchmarks.ensure(t),
      }))
      .sort((a, b) => b.benchmark.overall - a.benchmark.overall);
    return jsonOk({ leaderboard });
  }

  const tool = hub.discovery.getTool(toolId);
  if (!tool) return jsonError('Tool not found', 'NOT_FOUND', 404);

  const latest = hub.benchmarks.ensure(tool);
  const history = hub.benchmarks.getHistory(tool.id);
  hub.analytics.track({ type: 'view', resourceType: 'benchmark', resourceId: tool.id });

  return jsonOk({ tool, latest, history });
}
