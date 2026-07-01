import { handleReviews, handleCreateReview } from '@ai-pass/store-api';
import { jsonOk, jsonError } from '@/src/lib/store-api';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  const resourceId = new URL(request.url).searchParams.get('resourceId') ?? undefined;
  return jsonOk(handleReviews(resourceId).data);
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const result = handleCreateReview(body);
    return jsonOk(result.data, 201);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Review failed');
  }
}
