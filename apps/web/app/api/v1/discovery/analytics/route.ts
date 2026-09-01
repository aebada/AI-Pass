import { jsonOk, getDiscoveryHub } from '@/src/lib/discovery-api';

export const runtime = 'nodejs';

export async function GET(): Promise<Response> {
  const hub = getDiscoveryHub();
  const tools = hub.discovery.listTools();
  return jsonOk({
    summary: hub.analytics.summary(),
    dashboard: hub.analytics.dashboard(tools),
    catalog: hub.discovery.catalogStats(),
  });
}
