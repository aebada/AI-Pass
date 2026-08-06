import { NextResponse } from 'next/server';
import { getExecutionEngine } from '@ai-pass/runtime-core';
import type { PlanInput } from '@ai-pass/runtime-core';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as { input: PlanInput };
    const engine = getExecutionEngine();
    const { plan } = engine.plan({ input: body.input });
    return NextResponse.json({ plan });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Plan failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
