import { getTwinAutopilotService } from '@ai-pass/twin-autopilot';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const twinId = new URL(request.url).searchParams.get('twinId') || undefined;
  return NextResponse.json({ tasks: getTwinAutopilotService().listProactive(twinId) });
}

export async function POST(request: Request) {
  const svc = getTwinAutopilotService();
  const body = (await request.json().catch(() => null)) as {
    action?: 'enqueue' | 'notify';
    twinId?: string;
    title?: string;
    reason?: string;
    dueAt?: string;
    channel?: 'whatsapp' | 'sms' | 'email' | 'in_app';
    taskId?: string;
    whatsappTo?: string;
  } | null;

  if (body?.action === 'enqueue' && body.twinId && body.title && body.reason) {
    const task = svc.enqueueProactive({
      twinId: body.twinId,
      title: body.title,
      reason: body.reason,
      dueAt: body.dueAt,
      channel: body.channel,
    });
    return NextResponse.json({ task });
  }

  if (body?.action === 'notify' && body.taskId) {
    const task = await svc.notifyProactive(body.taskId, body.whatsappTo);
    if (!task) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json({ task });
  }

  return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
}
