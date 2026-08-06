import { defaultContentAIPlatform, parseTenantId, parseTier, parseUserId } from '@ai-pass/content-ai/api';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const tenantId = parseTenantId(request.headers);
  const body = (await request.json()) as {
    text?: string;
    tone?: 'professional' | 'casual' | 'academic';
    modelId?: string;
  };

  if (!body.text?.trim()) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 });
  }

  try {
    const result = await defaultContentAIPlatform.humanizer.humanize({
      tenantId,
      userId: parseUserId(request.headers),
      tier: parseTier(request.headers),
      text: body.text,
      tone: body.tone,
      modelId: body.modelId,
    });
    return NextResponse.json({ result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Humanization failed' },
      { status: 500 },
    );
  }
}
