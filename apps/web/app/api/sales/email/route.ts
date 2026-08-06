import { NextResponse } from 'next/server';
import { defaultSalesAIService, parseTenantId, parseTier, parseUserId } from '@ai-pass/sales-ai/api';

export async function POST(request: Request) {
  const req = request as unknown as import('next/server').NextRequest;
  const body = await request.json();
  try {
    const result = defaultSalesAIService.generateEmail({
      tenantId: parseTenantId(req),
      userId: parseUserId(req),
      tier: parseTier(req),
      type: body.type ?? 'cold',
      leadId: body.leadId,
      contactId: body.contactId,
      recipientName: body.recipientName,
      recipientEmail: body.recipientEmail,
      company: body.company,
      context: body.context,
      tone: body.tone,
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 400 });
  }
}
