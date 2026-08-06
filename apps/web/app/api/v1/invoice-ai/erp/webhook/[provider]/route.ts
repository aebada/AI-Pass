import { ok } from '@ai-pass/platform-core';
import { defaultERPService } from '@ai-pass/invoice-ai/api';
import { isERPProvider } from '@ai-pass/erp-connectors';
import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> },
): Promise<NextResponse> {
  const { provider } = await context.params;

  if (!isERPProvider(provider)) {
    return NextResponse.json({ error: `Unknown ERP provider: ${provider}` }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const event = defaultERPService.handleWebhook(provider, body as Record<string, unknown>);

  if (!event) {
    return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
  }

  return NextResponse.json(ok({ received: true, eventType: event.eventType, externalId: event.externalId }));
}
