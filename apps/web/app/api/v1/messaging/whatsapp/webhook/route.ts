import { getWhatsAppCloudClient } from '@ai-pass/messaging-connectors';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Meta WhatsApp Cloud API webhook.
 * Configure callback URL to: /api/v1/messaging/whatsapp/webhook
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const client = getWhatsAppCloudClient();
  const result = client.verifyWebhook({
    mode: url.searchParams.get('hub.mode'),
    token: url.searchParams.get('hub.verify_token'),
    challenge: url.searchParams.get('hub.challenge'),
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 403 });
  }
  return new NextResponse(result.challenge, {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  });
}

export async function POST(request: Request) {
  const client = getWhatsAppCloudClient();
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const inbound = client.ingestWebhook(body);

  // Twin reply path: echo acknowledgment when configured; agents can replace this.
  const replies = [];
  for (const msg of inbound) {
    if (!msg.text) continue;
    const reply = await client.sendText({
      to: msg.from,
      body: `AI-Pass twin received your message. We will act with your approvals.\n\nYou said: ${msg.text.slice(0, 500)}`,
      replyToMessageId: msg.id,
    });
    replies.push({ inboundId: msg.id, ...reply });
  }

  return NextResponse.json(
    { accepted: true, inbound: inbound.length, replies },
    { status: 200 },
  );
}
