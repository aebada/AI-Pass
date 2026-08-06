import { defaultInvoiceAIService } from '@ai-pass/invoice-ai/api';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = defaultInvoiceAIService.getInvoiceDetail(id);
  if (!detail) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }
  return NextResponse.json(detail);
}
