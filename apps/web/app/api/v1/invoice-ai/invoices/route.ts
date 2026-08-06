import { defaultInvoiceAIService, parseTenantId, parseUserId } from '@ai-pass/invoice-ai/api';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const tenantId = parseTenantId(request.headers);
  const invoices = defaultInvoiceAIService.listInvoices(tenantId);
  return NextResponse.json({ invoices, total: invoices.length });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { invoiceId?: string };
  if (!body.invoiceId) {
    return NextResponse.json({ error: 'invoiceId required' }, { status: 400 });
  }
  try {
    const result = defaultInvoiceAIService.validate({
      invoiceId: body.invoiceId,
      tenantId: parseTenantId(request.headers),
      userId: parseUserId(request.headers),
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Validation failed' },
      { status: 400 },
    );
  }
}
