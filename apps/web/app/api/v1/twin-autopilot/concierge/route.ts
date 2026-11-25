import { getTwinAutopilotService } from '@ai-pass/twin-autopilot';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const twinId = new URL(request.url).searchParams.get('twinId') || undefined;
  return NextResponse.json({ calls: getTwinAutopilotService().listConciergeCalls(twinId) });
}

export async function POST(request: Request) {
  const svc = getTwinAutopilotService();
  const body = (await request.json().catch(() => null)) as {
    action?: 'request' | 'approve';
    twinId?: string;
    to?: string;
    purpose?: string;
    callId?: string;
  } | null;

  if (body?.action === 'request' && body.twinId && body.to && body.purpose) {
    const call = svc.requestConciergeCall({
      twinId: body.twinId,
      to: body.to,
      purpose: body.purpose,
    });
    return NextResponse.json({ call });
  }

  if (body?.action === 'approve' && body.callId) {
    const call = svc.approveConciergeCall(body.callId);
    if (!call) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json({ call });
  }

  return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
}
