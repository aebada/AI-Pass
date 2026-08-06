import { NextResponse } from 'next/server';
import { createProviderHub, PROVIDER_DEFINITIONS, MODEL_CATALOG } from '@ai-pass/provider-hub';

export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse> {
  const hub = createProviderHub();
  const health = hub.health.checkAll();
  return NextResponse.json({
    providers: PROVIDER_DEFINITIONS,
    models: MODEL_CATALOG,
    health,
  });
}
