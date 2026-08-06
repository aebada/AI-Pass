import { getLiveSyncEngine } from '@ai-pass/livesync';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const engine = getLiveSyncEngine();
  return NextResponse.json({
    triggers: engine.listTriggers(),
    workflows: [...engine.store.workflows.values()],
  });
}
