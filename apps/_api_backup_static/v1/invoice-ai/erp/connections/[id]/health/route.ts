import { ok } from '@ai-pass/platform-core';
import { defaultERPService, parseTenantId } from '@ai-pass/invoice-ai/api';
import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const tenantId = parseTenantId(request.headers);
  const { id } = await context.params;

  try {
    const result = await defaultERPService.healthCheck(id, tenantId);
    return NextResponse.json(ok(result));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Health check failed';
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
