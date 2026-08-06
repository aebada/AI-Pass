import { getLiveSyncEngine } from '@ai-pass/livesync';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  context: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await context.params;
  const event = getLiveSyncEngine().getEvent(eventId);

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  return NextResponse.json(event);
}
