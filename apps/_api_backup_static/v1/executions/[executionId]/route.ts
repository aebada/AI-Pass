import { getLiveSyncEngine } from '@ai-pass/livesync';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  context: { params: Promise<{ executionId: string }> }
) {
  const { executionId } = await context.params;
  const execution = getLiveSyncEngine().getExecution(executionId);

  if (!execution) {
    return NextResponse.json({ error: 'Execution not found' }, { status: 404 });
  }

  return NextResponse.json({
    execution_id: execution.id,
    workflow_id: execution.workflow_id,
    event_id: execution.event_id,
    status: execution.status,
    decision: execution.decision,
    confidence: execution.confidence,
    result: execution.result,
    started_at: execution.started_at,
    finished_at: execution.finished_at,
  });
}
