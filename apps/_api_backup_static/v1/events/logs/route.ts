import { getLiveSyncEngine } from '@ai-pass/livesync';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('event_id') ?? undefined;
  const executionId = searchParams.get('execution_id') ?? undefined;
  const level = searchParams.get('level') ?? undefined;

  const engine = getLiveSyncEngine();
  const logs = engine.logger.getLogs({
    eventId,
    executionId,
    level: level as 'debug' | 'info' | 'warn' | 'error' | undefined,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 200,
  });

  return NextResponse.json({
    logs: logs.map((l) => ({
      id: l.id,
      level: l.level,
      message: l.message,
      timestamp: l.created_at,
      execution_type: l.execution_type,
      reference_id: l.reference_id,
      metadata: l.metadata_json,
    })),
  });
}
