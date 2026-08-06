import { jsonOk, getPlatform } from '@/src/lib/marketplace-api';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const platform = getPlatform();

  const filters = {
    keyword: searchParams.get('q') ?? undefined,
    category: (searchParams.get('category') as never) ?? undefined,
    skillCategory: (searchParams.get('skillCategory') as never) ?? undefined,
    developerId: searchParams.get('developerId') ?? undefined,
    pricing: (searchParams.get('pricing') as never) ?? undefined,
    model: searchParams.get('model') ?? undefined,
    certified: searchParams.get('certified') === 'true' ? true : undefined,
    enterpriseReady: searchParams.get('enterprise') === 'true' ? true : undefined,
    openSource: searchParams.get('openSource') === 'true' ? true : undefined,
    trending: searchParams.get('trending') === 'true' ? true : undefined,
    topRated: searchParams.get('topRated') === 'true' ? true : undefined,
    free: searchParams.get('free') === 'true' ? true : undefined,
    paid: searchParams.get('paid') === 'true' ? true : undefined,
  };

  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') ?? '20', 10);

  const results = platform.search.search(filters, page, pageSize);
  return jsonOk(results);
}
