import { getTwinAutopilotService } from '@ai-pass/twin-autopilot';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(getTwinAutopilotService().snapshot());
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    action?: string;
    kind?: 'personal' | 'employee' | 'business' | 'robotics';
    displayName?: string;
  } | null;

  if (body?.action === 'create_twin' && body.kind && body.displayName) {
    const twin = getTwinAutopilotService().createTwin({
      kind: body.kind,
      displayName: body.displayName,
    });
    return NextResponse.json({ twin });
  }

  return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
}
