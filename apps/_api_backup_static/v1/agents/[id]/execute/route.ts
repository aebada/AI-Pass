import { NextResponse } from 'next/server';
import { getWebAgentStudio } from '../../../../../../lib/agent-studio-platform';
import type { ExecuteAgentRequest } from '@ai-pass/agent-studio';

export const runtime = 'nodejs';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = (await request.json()) as Omit<ExecuteAgentRequest, 'agentId'>;
    const studio = getWebAgentStudio();
    const result = await studio.execution.execute({
      agentId: id,
      input: body.input ?? {},
      tenantId: body.tenantId,
      userId: body.userId ?? 'demo-user',
      membershipTier: body.membershipTier ?? 'professional',
      skipGovernance: body.skipGovernance,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Execute failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
