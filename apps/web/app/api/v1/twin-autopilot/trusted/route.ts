import { getTwinAutopilotService } from '@ai-pass/twin-autopilot';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const twinId = new URL(request.url).searchParams.get('twinId') || undefined;
  return NextResponse.json({ peers: getTwinAutopilotService().listTrustedPeers(twinId) });
}

export async function POST(request: Request) {
  const svc = getTwinAutopilotService();
  const body = (await request.json().catch(() => null)) as {
    action?: 'add' | 'approve' | 'message';
    twinId?: string;
    displayName?: string;
    peerTwinId?: string;
    peerId?: string;
    channel?: 'whatsapp' | 'sms' | 'in_app';
    text?: string;
    whatsappTo?: string;
  } | null;

  if (!body?.action) {
    return NextResponse.json({ error: 'action required' }, { status: 400 });
  }

  if (body.action === 'add' && body.twinId && body.displayName && body.peerTwinId) {
    const peer = svc.addTrustedPeer({
      twinId: body.twinId,
      displayName: body.displayName,
      peerTwinId: body.peerTwinId,
      channel: body.channel,
    });
    return NextResponse.json({ peer });
  }

  if (body.action === 'approve' && body.peerId) {
    const peer = svc.approveTrustedPeer(body.peerId);
    if (!peer) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json({ peer });
  }

  if (body.action === 'message' && body.twinId && body.peerId && body.text) {
    const result = await svc.messageTrustedPeer({
      fromTwinId: body.twinId,
      peerId: body.peerId,
      text: body.text,
      whatsappTo: body.whatsappTo,
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
}
