import { NextResponse } from 'next/server';
import {
  handleListApps,
  handleCreateApp,
  handleSearch,
  toJsonResponse,
} from '@ai-pass/marketplace-api';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q');
  if (q) {
    return toJsonResponse(handleSearch({ keyword: q }), NextResponse);
  }
  return toJsonResponse(handleListApps(), NextResponse);
}

export async function POST(request: Request) {
  const body = await request.json();
  return toJsonResponse(handleCreateApp(body), NextResponse);
}
