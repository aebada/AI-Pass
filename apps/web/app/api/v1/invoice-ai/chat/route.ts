import { defaultInvoiceAIService, parseTenantId, parseUserId } from '@ai-pass/invoice-ai/api';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = (await request.json()) as { query?: string; tenantId?: string };

  if (!body.query) {
    return NextResponse.json({ error: 'query required' }, { status: 400 });
  }

  const result = defaultInvoiceAIService.chat({
    tenantId: body.tenantId ?? parseTenantId(request.headers),
    userId: parseUserId(request.headers),
    query: body.query,
  });

  return NextResponse.json(result);
}
