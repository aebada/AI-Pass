import { getHospitalTwinService } from '@ai-pass/hospital-twin';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(getHospitalTwinService().snapshot());
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    action?: string;
    seed?: number;
    modules?: string[];
  } | null;
  const svc = getHospitalTwinService();

  if (body?.action === 'reset') {
    return NextResponse.json(svc.reset(body.seed ?? 42));
  }

  return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
}
