import { NextResponse } from 'next/server';
import { defaultSupplyChainAIService, parseTenantId, parseUserId, parseTier } from '@ai-pass/supply-chain-ai';

export async function POST(request: Request) {
  try {
    const tenantId = parseTenantId(request.headers);
    const userId = parseUserId(request.headers);
    const tier = parseTier(request.headers);
    const body = await request.json();
    const result = defaultSupplyChainAIService.generateReport({
      tenantId,
      userId,
      tier,
      evaluationId: body.evaluationId,
      type: body.type ?? 'report',
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 400 });
  }
}
