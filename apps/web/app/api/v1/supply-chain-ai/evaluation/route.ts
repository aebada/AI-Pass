import { NextResponse } from 'next/server';
import { defaultSupplyChainAIService, parseTenantId, parseUserId, parseTier } from '@ai-pass/supply-chain-ai';

export async function GET(request: Request) {
  const tenantId = parseTenantId(request.headers);
  const url = new URL(request.url);
  const eventId = url.searchParams.get('eventId') ?? undefined;
  const data = defaultSupplyChainAIService.listEvaluations(tenantId, eventId ?? undefined);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const tenantId = parseTenantId(request.headers);
    const userId = parseUserId(request.headers);
    const tier = parseTier(request.headers);
    const body = await request.json();
    const result = await defaultSupplyChainAIService.runEvaluation({
      tenantId,
      userId,
      tier,
      eventId: body.eventId,
      scoringTemplateId: body.scoringTemplateId,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 400 });
  }
}
