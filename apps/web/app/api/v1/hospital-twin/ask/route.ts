import { getHospitalTwinService, type RoleId } from '@ai-pass/hospital-twin';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    question?: string;
    role?: RoleId;
  } | null;
  if (!body?.question) {
    return NextResponse.json({ error: 'question required' }, { status: 400 });
  }
  return NextResponse.json(getHospitalTwinService().ask(body.question, body.role ?? 'coo'));
}
