import { defaultInvoiceAIService, parseTenantId, parseUserId } from '@ai-pass/invoice-ai/api';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = (await request.json()) as {
    invoiceId?: string;
    approverId?: string;
    approverName?: string;
    reason?: string;
  };

  if (!body.invoiceId || !body.reason) {
    return NextResponse.json({ error: 'invoiceId and reason required' }, { status: 400 });
  }

  try {
    const result = defaultInvoiceAIService.reject({
      invoiceId: body.invoiceId,
      tenantId: parseTenantId(request.headers),
      approverId: body.approverId ?? parseUserId(request.headers),
      approverName: body.approverName ?? 'Approver',
      reason: body.reason,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Rejection failed' },
      { status: 400 },
    );
  }
}
