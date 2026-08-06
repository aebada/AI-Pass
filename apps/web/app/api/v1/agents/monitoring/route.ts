import { NextResponse } from 'next/server';
import { getWebAgentStudio } from '../../../../../lib/agent-studio-platform';

export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse> {
  const studio = getWebAgentStudio();
  const snapshot = studio.monitoring.getSnapshot();
  const recent = studio.monitoring.listRecent(10);
  return NextResponse.json({ snapshot, recent });
}
