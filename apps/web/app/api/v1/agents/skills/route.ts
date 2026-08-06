import { NextResponse } from 'next/server';
import { getWebAgentStudio } from '../../../../../lib/agent-studio-platform';

export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse> {
  const studio = getWebAgentStudio();
  return NextResponse.json({ skills: studio.skills.listAll() });
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const studio = getWebAgentStudio();
    const skill = studio.skills.register(body);
    return NextResponse.json({ skill }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Create failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
