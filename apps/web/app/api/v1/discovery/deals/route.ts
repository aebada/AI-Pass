import { jsonOk, getDiscoveryHub } from '@/src/lib/discovery-api';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const hub = getDiscoveryHub();
  const id = searchParams.get('id');

  if (id) {
    const deal = hub.deals.get(id);
    if (!deal) return jsonOk({ deal: null, tools: [] });
    return jsonOk({ deal, tools: hub.deals.getTools(id) });
  }

  return jsonOk(hub.deals.list());
}

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as { dealId?: string; userId?: string };
  const hub = getDiscoveryHub();

  if (!body.dealId) {
    return jsonOk({ success: false, message: 'dealId required' });
  }

  const result = hub.deals.activate(body.dealId, body.userId ?? 'demo-user');
  hub.analytics.track({ type: 'conversion', resourceType: 'deal', resourceId: body.dealId });
  return jsonOk(result);
}
