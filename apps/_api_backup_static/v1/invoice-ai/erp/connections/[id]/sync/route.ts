import { ok } from '@ai-pass/platform-core';
import { defaultERPService, parseTenantId } from '@ai-pass/invoice-ai/api';
import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const tenantId = parseTenantId(request.headers);
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const since = typeof body.since === 'string' ? body.since : undefined;

  try {
    const result = await defaultERPService.syncConnection(id, tenantId, since);
    return NextResponse.json(
      ok({
        status: result.status,
        pushed: result.pushed,
        pulled: result.pulled,
        failed: result.failed,
        errors: result.errors,
        completedAt: result.completedAt,
      }),
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sync failed';
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
