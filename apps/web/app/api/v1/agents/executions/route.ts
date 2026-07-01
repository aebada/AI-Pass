import { NextResponse } from 'next/server';
import { getWebAgentStudio } from '../../../../../lib/agent-studio-platform';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId') ?? undefined;
  const limit = Number(searchParams.get('limit') ?? 50);
  const studio = getWebAgentStudio();
  const executions = studio.execution.list({ agentId, limit });
  return NextResponse.json({ executions });
}
