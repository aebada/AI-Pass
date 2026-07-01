import { getLiveSyncEngine } from '@ai-pass/livesync';
import type { LiveRunRequest } from '@ai-pass/shared';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = (await request.json()) as LiveRunRequest;

  if (!body.event_type || !body.payload) {
    return NextResponse.json(
      { error: 'event_type and payload are required' },
      { status: 400 }
    );
  }

  try {
    const result = await getLiveSyncEngine().runLive(body);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Live run failed' },
      { status: 500 }
    );
  }
}
