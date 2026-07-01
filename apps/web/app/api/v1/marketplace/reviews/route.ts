import { NextResponse } from 'next/server';
import { handleCreateReview, handleListReviews, toJsonResponse } from '@ai-pass/marketplace-api';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const resourceId = url.searchParams.get('resourceId');
  if (!resourceId) {
    return NextResponse.json({ error: 'resourceId required' }, { status: 400 });
  }
  return toJsonResponse(handleListReviews(resourceId), NextResponse);
}

export async function POST(request: Request) {
  const body = await request.json();
  return toJsonResponse(handleCreateReview(body), NextResponse);
}
