import { NextResponse } from 'next/server';
import {
  defaultCustomerSupportAIService,
  parseTenantId,
  parseUserId,
} from '@ai-pass/customer-support-ai/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const req = request as unknown as import('next/server').NextRequest;
    const result = defaultCustomerSupportAIService.submitFeedback({
      tenantId: parseTenantId(req) ?? body.tenantId,
      userId: parseUserId(req) ?? body.userId,
      conversationId: body.conversationId,
      rating: body.rating,
      comment: body.comment,
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
