import { getLiveSyncEngine } from '@ai-pass/livesync';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse> {
  const engine = getLiveSyncEngine();
  const health = engine.getHealth();
  const metrics = engine.getMetrics();

  return NextResponse.json({
    ...health,
    metrics,
    subscribers: engine.channels.subscriberCount(),
  });
}
