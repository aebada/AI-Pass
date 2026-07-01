import { defaultContentAIPlatform, parseTenantId, parseTier, parseUserId } from '@ai-pass/content-ai/api';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const tenantId = parseTenantId(request.headers);
  const body = (await request.json()) as { text?: string };

  if (!body.text?.trim()) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 });
  }

  try {
    const result = await defaultContentAIPlatform.detector.detect({
      tenantId,
      userId: parseUserId(request.headers),
      tier: parseTier(request.headers),
      text: body.text,
    });
    return NextResponse.json({ result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Detection failed' },
      { status: 500 },
    );
  }
}
