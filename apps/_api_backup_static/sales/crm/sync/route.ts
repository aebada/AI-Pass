import { NextResponse } from 'next/server';
import { defaultSalesAIService, parseTenantId, parseTier, parseUserId } from '@ai-pass/sales-ai/api';

export async function POST(request: Request) {
  const req = request as unknown as import('next/server').NextRequest;
  const body = await request.json();
  try {
    const result = await defaultSalesAIService.syncCrm({
      tenantId: parseTenantId(req),
      userId: parseUserId(req),
      tier: parseTier(req),
      provider: body.provider ?? 'hubspot',
      entityType: body.entityType ?? 'lead',
      entityId: body.entityId,
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 400 });
  }
}
