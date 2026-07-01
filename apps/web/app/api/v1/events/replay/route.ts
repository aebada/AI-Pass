import { getLiveSyncEngine } from '@ai-pass/livesync';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await request.json();
  const eventId = body.event_id ?? body.eventId;
  const jobId = body.job_id ?? body.jobId;

  const engine = getLiveSyncEngine();

  if (jobId && typeof jobId === 'string') {
    const job = engine.replayDeadLetter(jobId);
    if (!job) return NextResponse.json({ error: 'Dead letter job not found' }, { status: 404 });
    return NextResponse.json({ status: 'accepted', job_id: job.id, event_id: job.eventId }, { status: 202 });
  }

  if (!eventId || typeof eventId !== 'string') {
    return NextResponse.json({ error: 'event_id or job_id required' }, { status: 400 });
  }

  const result = await engine.replayEvent(eventId);
  const status = result.status === 'accepted' ? 202 : 400;
  return NextResponse.json(result, { status });
}
