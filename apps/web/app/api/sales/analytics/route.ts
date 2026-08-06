import { NextResponse } from 'next/server';
import { defaultSalesAIService, parseTenantId } from '@ai-pass/sales-ai/api';

export async function GET(request: Request) {
  const req = request as unknown as import('next/server').NextRequest;
  const analytics = defaultSalesAIService.getAnalytics(parseTenantId(req));
  return NextResponse.json(analytics);
}
