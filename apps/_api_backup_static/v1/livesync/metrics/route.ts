import { formatPrometheusMetrics, getLiveSyncEngine } from '@ai-pass/livesync';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format');
  const engine = getLiveSyncEngine();
  const metrics = engine.getLiveSyncMetrics();

  if (format === 'prometheus') {
    return new NextResponse(formatPrometheusMetrics(metrics), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  return NextResponse.json({
    metrics,
    health: engine.getHealth(),
    queue: engine.getQueueStats(),
  });
}
