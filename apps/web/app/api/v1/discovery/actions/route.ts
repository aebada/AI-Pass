import { jsonOk, jsonError, getDiscoveryHub } from '@/src/lib/discovery-api';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const hub = getDiscoveryHub();
  const toolId = searchParams.get('tool');
  if (!toolId) return jsonError('tool query param required', 'MISSING_PARAMS', 400);

  const tool = hub.discovery.getTool(toolId);
  if (!tool) return jsonError('Tool not found', 'NOT_FOUND', 404);

  return jsonOk({
    tool,
    actions: hub.getToolActions(tool, { orgId: searchParams.get('org') ?? undefined }),
    routingPreferences: hub.routingPreferences,
    installMethods: tool.profile.installMethods,
  });
}
