import { NextResponse } from 'next/server';
import { handleCatalogHome, handleGetAnalytics, toJsonResponse } from '@ai-pass/marketplace-api';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/v1/marketplace', '');

  if (path === '/catalog' || path === '/catalog/') {
    return toJsonResponse(handleCatalogHome(), NextResponse);
  }
  if (path === '/analytics' || path === '/analytics/') {
    return toJsonResponse(
      handleGetAnalytics({
        developerId: url.searchParams.get('developerId') ?? undefined,
        resourceId: url.searchParams.get('resourceId') ?? undefined,
        resourceType: (url.searchParams.get('resourceType') as 'app' | 'skill') ?? undefined,
      }),
      NextResponse,
    );
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
