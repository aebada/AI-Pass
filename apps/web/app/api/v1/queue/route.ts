import { getLiveSyncEngine } from '@ai-pass/livesync';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const engine = getLiveSyncEngine();
  const stats = engine.getQueueStats();
  const deadLetters = engine.getDeadLetters();
  const health = engine.getHealth();

  return NextResponse.json({
    stats,
    dead_letters: deadLetters,
    health,
    redis_connected: engine.redisQueue.isConnected(),
  });
}
