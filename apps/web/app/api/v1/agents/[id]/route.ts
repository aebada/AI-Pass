import { NextResponse } from 'next/server';
import { getWebAgentStudio } from '../../../../../lib/agent-studio-platform';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const studio = getWebAgentStudio();
  const agent = studio.agents.get(id);
  if (!agent) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const versions = studio.agents.getVersions(id);
  const metrics = studio.monitoring.getAgentMetrics(id);
  const workflow = studio.workflows.list(id)[0];
  return NextResponse.json({ agent, versions, metrics, workflow });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const body = await request.json();
  const studio = getWebAgentStudio();
  const agent = studio.agents.update(id, body);
  if (!agent) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ agent });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const studio = getWebAgentStudio();
  const deleted = studio.agents.delete(id);
  return NextResponse.json({ deleted });
}
