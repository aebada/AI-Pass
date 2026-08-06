import { jsonOk, getDiscoveryHub } from '@/src/lib/discovery-api';

export const runtime = 'nodejs';

export async function GET(): Promise<Response> {
  const hub = getDiscoveryHub();
  const home = hub.discovery.getHome();
  return jsonOk({
    featured: home.featured,
    editorsPicks: home.editorsPicks,
    highestRated: home.highestRated,
  });
}
