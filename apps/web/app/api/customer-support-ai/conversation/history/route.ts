import { NextResponse } from 'next/server';
import { defaultCustomerSupportAIService, parseTenantId } from '@ai-pass/customer-support-ai/api';

export async function GET(request: Request) {
  const req = request as unknown as import('next/server').NextRequest;
  const tenantId = parseTenantId(req);
  const history = defaultCustomerSupportAIService.getHistory(tenantId);
  return NextResponse.json(history);
}
