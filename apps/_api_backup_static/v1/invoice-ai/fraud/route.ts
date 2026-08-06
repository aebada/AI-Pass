import { defaultInvoiceAIService, parseTenantId } from '@ai-pass/invoice-ai/api';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const alerts = defaultInvoiceAIService.listFraudAlerts(parseTenantId(request.headers));
  return NextResponse.json({ alerts });
}
