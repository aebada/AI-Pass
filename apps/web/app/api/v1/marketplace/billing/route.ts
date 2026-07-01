import { NextResponse } from 'next/server';
import { handleBilling, toJsonResponse } from '@ai-pass/marketplace-api';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await request.json();
  return toJsonResponse(handleBilling(body), NextResponse);
}
