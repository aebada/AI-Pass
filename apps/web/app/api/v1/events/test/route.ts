import { getLiveSyncEngine } from '@ai-pass/livesync';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await request.json();
  const result = await getLiveSyncEngine().ingestTestEvent(body);
  const status = result.status === 'accepted' ? 202 : 400;
  return NextResponse.json(result, { status });
}
