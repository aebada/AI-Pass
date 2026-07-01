import { defaultContentAIPlatform, parseTenantId } from '@ai-pass/content-ai/api';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const tenantId = parseTenantId(request.headers);
  const history = defaultContentAIPlatform.history.list(tenantId);
  return NextResponse.json({ history });
}
