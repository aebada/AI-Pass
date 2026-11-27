import { getLifecycleIntelligenceService } from '@ai-pass/lifecycle-intelligence';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const datasetId = new URL(request.url).searchParams.get('datasetId') || undefined;
  return NextResponse.json({
    issues: getLifecycleIntelligenceService().analyzeRequirements(datasetId),
  });
}
