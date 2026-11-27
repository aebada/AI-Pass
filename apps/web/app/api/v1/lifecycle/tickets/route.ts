import { NextResponse } from 'next/server';
import { getLifecycleIntelligenceService } from '@ai-pass/lifecycle-intelligence';

export const dynamic = 'force-static';

export async function GET() {
  const svc = getLifecycleIntelligenceService();
  return NextResponse.json({
    apps: svc.listStudioApps().filter((a) => a.kind === 'tickets'),
    hint: 'POST { ticketId, datasetId?, language? } to analyze a service ticket.',
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    ticketId?: string;
    datasetId?: string;
    language?: string;
  };
  if (!body.ticketId) {
    return NextResponse.json({ error: 'ticketId required' }, { status: 400 });
  }
  const svc = getLifecycleIntelligenceService();
  const analysis = svc.analyzeTicket(body.ticketId, body.datasetId, body.language || 'en');
  return NextResponse.json({ analysis });
}
