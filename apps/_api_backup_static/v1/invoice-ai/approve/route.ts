import { defaultInvoiceAIService, parseTenantId, parseUserId } from '@ai-pass/invoice-ai/api';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = (await request.json()) as {
    invoiceId?: string;
    approverId?: string;
    approverName?: string;
    comment?: string;
  };

  if (!body.invoiceId) {
    return NextResponse.json({ error: 'invoiceId required' }, { status: 400 });
  }

  try {
    const result = defaultInvoiceAIService.approve({
      invoiceId: body.invoiceId,
      tenantId: parseTenantId(request.headers),
      approverId: body.approverId ?? parseUserId(request.headers),
      approverName: body.approverName ?? 'Approver',
      comment: body.comment,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Approval failed' },
      { status: 400 },
    );
  }
}
