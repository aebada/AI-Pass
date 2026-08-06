import { defaultPresenceAuditPlatform } from '@ai-pass/presence-audit/api';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ providers: defaultPresenceAuditPlatform.listProviders() });
}
