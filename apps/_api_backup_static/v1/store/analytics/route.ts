import { handleAnalytics } from '@ai-pass/store-api';
import { jsonOk } from '@/src/lib/store-api';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const result = handleAnalytics({
    developerId: url.searchParams.get('developerId') ?? undefined,
    resourceId: url.searchParams.get('resourceId') ?? undefined,
    resourceType: (url.searchParams.get('resourceType') as 'app' | 'skill') ?? undefined,
  });
  return jsonOk(result.data);
}
