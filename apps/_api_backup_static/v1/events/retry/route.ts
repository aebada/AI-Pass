import { getLiveSyncEngine } from '@ai-pass/livesync';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await request.json();
  const eventId = body.event_id ?? body.eventId;
  if (!eventId || typeof eventId !== 'string') {
    return NextResponse.json({ error: 'event_id required' }, { status: 400 });
  }

  const result = await getLiveSyncEngine().retryEvent(eventId);
  const status = result.status === 'accepted' ? 202 : 400;
  return NextResponse.json(result, { status });
}
