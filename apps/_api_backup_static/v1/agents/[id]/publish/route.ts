import { NextResponse } from 'next/server';
import { getWebAgentStudio } from '../../../../../../lib/agent-studio-platform';
import type { PublishRequest } from '@ai-pass/agent-studio';

export const runtime = 'nodejs';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = (await request.json()) as Omit<PublishRequest, 'agentId'>;
    const studio = getWebAgentStudio();
    const result = studio.publishing.publish({ agentId: id, ...body });
    return NextResponse.json({ result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Publish failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
