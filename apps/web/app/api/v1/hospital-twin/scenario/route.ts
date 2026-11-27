import { getHospitalTwinService, type ScenarioId } from '@ai-pass/hospital-twin';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { scenarioId?: ScenarioId } | null;
  if (!body?.scenarioId) {
    return NextResponse.json({ error: 'scenarioId required' }, { status: 400 });
  }
  return NextResponse.json(getHospitalTwinService().injectScenario(body.scenarioId));
}
