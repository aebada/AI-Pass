import { NextResponse } from 'next/server';
import { defaultSalesAIService, parseTenantId, parseTier, parseUserId } from '@ai-pass/sales-ai/api';

export async function POST(request: Request) {
  const req = request as unknown as import('next/server').NextRequest;
  const body = await request.json();
  try {
    const result = defaultSalesAIService.generateProposal({
      tenantId: parseTenantId(req),
      userId: parseUserId(req),
      tier: parseTier(req),
      type: body.type ?? 'proposal',
      leadId: body.leadId,
      dealId: body.dealId,
      title: body.title,
      requirements: body.requirements,
      budget: body.budget,
      currency: body.currency,
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 400 });
  }
}
