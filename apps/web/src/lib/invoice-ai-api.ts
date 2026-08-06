import {
  checkAction,
  parseTenantId,
  parseUserId,
  parseTier,
  parseUserName,
  type InvoiceAIAction,
} from '@ai-pass/invoice-ai/api';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export function jsonError(message: string, code = 'BAD_REQUEST', status = 400): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

export function requireAction(request: Request, action: InvoiceAIAction): NextResponse | null {
  const { allowed } = checkAction(request.headers, action);
  if (!allowed) {
    return jsonError(`Forbidden: requires permission for ${action}`, 'FORBIDDEN', 403);
  }
  return null;
}

export { parseTenantId, parseUserId, parseTier, parseUserName, checkAction };
