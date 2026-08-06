import { NextResponse } from 'next/server';
import { defaultSupplyChainAIService, parseTenantId, parseUserId, parseTier } from '@ai-pass/supply-chain-ai';

export async function GET(request: Request) {
  const tenantId = parseTenantId(request.headers);
  const data = defaultSupplyChainAIService.listEvents(tenantId);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const tenantId = parseTenantId(request.headers);
    const userId = parseUserId(request.headers);
    const tier = parseTier(request.headers);
    const body = await request.json();
    const result = defaultSupplyChainAIService.createEvent({
      tenantId,
      userId,
      tier,
      title: body.title,
      category: body.category,
      department: body.department,
      deadline: body.deadline,
      currency: body.currency ?? 'EUR',
      budgetCap: body.budgetCap,
      requirementsNL: body.requirementsNL,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 400 });
  }
}
