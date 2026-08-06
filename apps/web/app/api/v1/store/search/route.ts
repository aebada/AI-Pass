import { handleSearch } from '@ai-pass/store-api';
import { jsonOk } from '@/src/lib/store-api';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const filters = {
    keyword: url.searchParams.get('q') ?? undefined,
    category: url.searchParams.get('category') as never,
    trending: url.searchParams.get('trending') === 'true' || undefined,
    enterpriseReady: url.searchParams.get('enterprise') === 'true' || undefined,
    certified: url.searchParams.get('certified') === 'true' || undefined,
    free: url.searchParams.get('free') === 'true' || undefined,
    semantic: url.searchParams.get('semantic') === 'true' || undefined,
  };
  const page = Number(url.searchParams.get('page') ?? 1);
  const pageSize = Number(url.searchParams.get('pageSize') ?? 20);
  return jsonOk(handleSearch(filters, page, pageSize).data);
}
