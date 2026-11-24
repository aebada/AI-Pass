import { getWhatsAppCloudClient } from '@ai-pass/messaging-connectors';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    to?: string;
    text?: string;
    replyToMessageId?: string;
  } | null;

  if (!body?.to || !body?.text?.trim()) {
    return NextResponse.json(
      { error: 'to and text are required' },
      { status: 400 },
    );
  }

  const client = getWhatsAppCloudClient();
  const result = await client.sendText({
    to: body.to,
    body: body.text.trim(),
    replyToMessageId: body.replyToMessageId,
  });

  return NextResponse.json(result, { status: result.success ? 200 : 502 });
}
