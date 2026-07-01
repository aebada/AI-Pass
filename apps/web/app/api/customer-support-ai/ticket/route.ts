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
    const result = defaultCustomerSupportAIService.createTicket({
      tenantId: parseTenantId(req) ?? body.tenantId,
      userId: parseUserId(req) ?? body.userId,
      customerId: body.customerId,
      conversationId: body.conversationId,
      subject: body.subject,
      description: body.description,
      priority: body.priority,
      category: body.category,
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const req = request as unknown as import('next/server').NextRequest;
  const tenantId = parseTenantId(req);
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (id) {
    const ticket = defaultCustomerSupportAIService.getTicket(id);
    if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ticket });
  }
  return NextResponse.json({ tickets: defaultCustomerSupportAIService.listTickets(tenantId) });
}
