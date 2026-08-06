import { NextResponse } from 'next/server';
import { getMarketplaceRuntime } from '@ai-pass/marketplace-runtime';

export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse> {
  const rt = getMarketplaceRuntime();
  const apps = rt.apps.list();
  const packs = rt.industryPacks.list();
  return NextResponse.json({ apps, industryPacks: packs });
}
