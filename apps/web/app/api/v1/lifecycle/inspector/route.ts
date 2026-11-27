import { getLifecycleIntelligenceService } from '@ai-pass/lifecycle-intelligence';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    ticketOrDefect?: string;
    datasetId?: string;
  } | null;
  if (!body?.ticketOrDefect?.trim()) {
    return NextResponse.json({ error: 'ticketOrDefect required' }, { status: 400 });
  }
  const result = getLifecycleIntelligenceService().inspectError(
    body.ticketOrDefect.trim(),
    body.datasetId,
  );
  return NextResponse.json({ result });
}
