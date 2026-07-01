import { NextResponse } from 'next/server';
import { handleGetWallet, toJsonResponse } from '@ai-pass/marketplace-api';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId') ?? 'demo-user';
  return toJsonResponse(handleGetWallet(userId), NextResponse);
}
