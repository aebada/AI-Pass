import { jsonOk, getDiscoveryHub } from '@/src/lib/discovery-api';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const hub = getDiscoveryHub();
  const slug = searchParams.get('slug');

  if (slug) {
    const collection = hub.collections.get(slug);
    if (!collection) {
      return jsonOk({ collection: null, tools: [] });
    }
    return jsonOk({ collection, tools: hub.collections.getTools(slug) });
  }

  return jsonOk(hub.collections.list());
}
