import { getLiveSyncEngine } from '@ai-pass/livesync';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const engine = getLiveSyncEngine();
  const statusParam = searchParams.get('status');
  const events = engine.listEvents({
    tenantId: searchParams.get('tenant_id') ?? undefined,
    eventType: searchParams.get('event_type') ?? undefined,
    status: statusParam as 'received' | 'queued' | 'processing' | 'processed' | 'failed' | 'retrying' | undefined,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 50,
    since: searchParams.get('since') ?? undefined,
  });

  return NextResponse.json({ events, total: events.length });
}

export async function POST(request: Request) {
  const body = await request.json();
  const idempotencyKey = request.headers.get('X-Idempotency-Key') ?? undefined;
  const tenantId = request.headers.get('X-Tenant-Id') ?? undefined;
  const result = await getLiveSyncEngine().ingestEvent(body, { tenantId });
  const status = result.status === 'accepted' ? 202 : 400;
  return NextResponse.json(result, { status });
}
