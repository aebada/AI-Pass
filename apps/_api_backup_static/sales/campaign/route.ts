import { NextResponse } from 'next/server';
import { defaultSalesAIService, parseTenantId, parseTier, parseUserId } from '@ai-pass/sales-ai/api';

export async function POST(request: Request) {
  const req = request as unknown as import('next/server').NextRequest;
  const body = await request.json();
  try {
    const result = defaultSalesAIService.createCampaign({
      tenantId: parseTenantId(req),
      userId: parseUserId(req),
      tier: parseTier(req),
      name: body.name,
      type: body.type ?? 'cold',
      leadIds: body.leadIds ?? [],
      steps: body.steps,
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 400 });
  }
}
