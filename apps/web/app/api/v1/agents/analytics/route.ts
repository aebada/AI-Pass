import { NextResponse } from 'next/server';
import { getWebAgentStudio } from '../../../../../lib/agent-studio-platform';

export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse> {
  const studio = getWebAgentStudio();
  const analytics = studio.analytics.getSummary();
  const listings = studio.publishing.list();
  return NextResponse.json({ analytics, listings });
}
