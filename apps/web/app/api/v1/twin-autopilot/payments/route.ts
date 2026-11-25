import { getTwinAutopilotService } from '@ai-pass/twin-autopilot';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const twinId = new URL(request.url).searchParams.get('twinId') || undefined;
  return NextResponse.json({ payments: getTwinAutopilotService().listPayments(twinId) });
}

export async function POST(request: Request) {
  const svc = getTwinAutopilotService();
  const body = (await request.json().catch(() => null)) as {
    action?: 'request' | 'decide';
    twinId?: string;
    amountCents?: number;
    currency?: string;
    merchant?: string;
    paymentId?: string;
    approve?: boolean;
  } | null;

  if (
    body?.action === 'request' &&
    body.twinId &&
    typeof body.amountCents === 'number' &&
    body.merchant
  ) {
    const payment = svc.requestPayment({
      twinId: body.twinId,
      amountCents: body.amountCents,
      currency: body.currency,
      merchant: body.merchant,
    });
    return NextResponse.json({ payment });
  }

  if (body?.action === 'decide' && body.paymentId && typeof body.approve === 'boolean') {
    const payment = svc.decidePayment(body.paymentId, body.approve);
    if (!payment) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json({ payment });
  }

  return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
}
