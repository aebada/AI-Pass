import {
  defaultComplianceAIService,
  parseTenantId,
  parseTier,
  parseUserId,
} from '@ai-pass/compliance-ai/api';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { message?: string; sessionId?: string };
    if (!body.message) {
      return NextResponse.json({ error: 'message required' }, { status: 400 });
    }
    const result = await defaultComplianceAIService.copilot.chat({
      tenantId: parseTenantId(request.headers),
      userId: parseUserId(request.headers),
      message: body.message,
      sessionId: body.sessionId,
      tier: parseTier(request.headers),
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Chat failed' },
      { status: 400 },
    );
  }
}
