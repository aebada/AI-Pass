import { NextResponse } from 'next/server';
import {
  defaultCustomerSupportAIService,
  parseTenantId,
  parseTier,
  parseUserId,
} from '@ai-pass/customer-support-ai/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const req = request as unknown as import('next/server').NextRequest;
    const result = await defaultCustomerSupportAIService.sendMessage({
      conversationId: body.conversationId,
      tenantId: parseTenantId(req) ?? body.tenantId,
      userId: parseUserId(req) ?? body.userId,
      tier: parseTier(req),
      content: body.content,
      language: body.language,
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
