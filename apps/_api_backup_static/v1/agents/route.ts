import { NextResponse } from 'next/server';
import { getWebAgentStudio } from '../../../../lib/agent-studio-platform';
import type { CreateAgentInput } from '@ai-pass/agent-studio';

export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse> {
  const studio = getWebAgentStudio();
  const agents = studio.agents.list();
  const snapshot = studio.monitoring.getSnapshot();
  return NextResponse.json({ agents, monitoring: snapshot });
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as CreateAgentInput;
    const studio = getWebAgentStudio();
    const agent = studio.agents.create(body);
    return NextResponse.json({ agent }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Create failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const studio = getWebAgentStudio();
  const deleted = studio.agents.delete(id);
  return NextResponse.json({ deleted });
}
