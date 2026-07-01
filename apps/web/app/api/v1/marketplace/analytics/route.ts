import { NextResponse } from 'next/server';
import { handleGetAnalytics, toJsonResponse } from '@ai-pass/marketplace-api';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  return toJsonResponse(
    handleGetAnalytics({
      developerId: url.searchParams.get('developerId') ?? undefined,
      resourceId: url.searchParams.get('resourceId') ?? undefined,
      resourceType: (url.searchParams.get('resourceType') as 'app' | 'skill') ?? undefined,
    }),
    NextResponse,
  );
}
