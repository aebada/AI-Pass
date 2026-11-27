import { getLifecycleIntelligenceService } from '@ai-pass/lifecycle-intelligence';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    question?: string;
    datasetId?: string;
  } | null;
  if (!body?.question?.trim()) {
    return NextResponse.json({ error: 'question required' }, { status: 400 });
  }
  const answer = getLifecycleIntelligenceService().explore(
    body.question.trim(),
    body.datasetId,
  );
  return NextResponse.json({ answer });
}
