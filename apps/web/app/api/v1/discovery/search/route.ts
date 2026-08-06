import { jsonOk, getDiscoveryHub } from '@/src/lib/discovery-api';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const hub = getDiscoveryHub();

  const filters = {
    keyword: searchParams.get('q') ?? undefined,
    category: (searchParams.get('category') as never) ?? undefined,
    tag: searchParams.get('tag') ?? undefined,
    industry: searchParams.get('industry') ?? undefined,
    developerId: searchParams.get('developerId') ?? undefined,
    free: searchParams.get('free') === 'true' ? true : undefined,
    paid: searchParams.get('paid') === 'true' ? true : undefined,
    openSource: searchParams.get('openSource') === 'true' ? true : undefined,
    enterprise: searchParams.get('enterprise') === 'true' ? true : undefined,
    certified: searchParams.get('certified') === 'true' ? true : undefined,
    trending: searchParams.get('trending') === 'true' ? true : undefined,
    topRated: searchParams.get('topRated') === 'true' ? true : undefined,
    region: searchParams.get('region') ?? undefined,
    language: searchParams.get('language') ?? undefined,
    provider: searchParams.get('provider') ?? undefined,
    useCase: searchParams.get('useCase') ?? undefined,
  };

  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') ?? '20', 10);
  const semantic = searchParams.get('semantic') === 'true';

  if (semantic && filters.keyword) {
    return jsonOk({
      tools: hub.search.semanticSearch(filters.keyword, pageSize),
      total: pageSize,
      page: 1,
      pageSize,
      mode: 'semantic',
    });
  }

  return jsonOk(hub.search.search(filters, page, pageSize));
}
