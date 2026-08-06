import { getLiveSyncEngine } from '@ai-pass/livesync';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function getEngine() {
  return getLiveSyncEngine();
}

export async function POST(request: Request) {
  const body = await request.json();
  const idempotencyKey = request.headers.get('X-Idempotency-Key') ?? undefined;
  const result = await getEngine().ingestWebhook(body, idempotencyKey);
  const status = result.status === 'accepted' ? 202 : 400;
  return NextResponse.json(result, { status });
}
