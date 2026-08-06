import { defaultComplianceAIService, parseTenantId } from '@ai-pass/compliance-ai/api';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const tenantId = parseTenantId(request.headers);
  const data = defaultComplianceAIService.getDashboard(tenantId);
  return NextResponse.json(data);
}
