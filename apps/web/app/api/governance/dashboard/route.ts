import { NextResponse } from 'next/server';
import { getGovernance } from '@/src/lib/governance-api';

export const runtime = 'nodejs';

export async function GET(): Promise<Response> {
  const gov = getGovernance();
  return NextResponse.json({ success: true, data: gov.getDashboard() });
}
