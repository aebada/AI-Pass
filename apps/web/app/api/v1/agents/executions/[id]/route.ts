import { NextResponse } from 'next/server';
import { getWebAgentStudio } from '../../../../../../lib/agent-studio-platform';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const studio = getWebAgentStudio();
  const execution = studio.execution.get(id);
  if (!execution) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ execution });
}
