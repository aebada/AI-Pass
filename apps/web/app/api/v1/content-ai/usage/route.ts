import { defaultContentAIPlatform, parseTenantId, parseTier } from '@ai-pass/content-ai/api';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const tenantId = parseTenantId(request.headers);
  const tier = parseTier(request.headers);
  const usage = defaultContentAIPlatform.getUsage(tenantId, tier);
  return NextResponse.json({ usage });
}
