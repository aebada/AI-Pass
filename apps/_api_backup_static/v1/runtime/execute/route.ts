import { NextResponse } from 'next/server';
import { getExecutionEngine } from '@ai-pass/runtime-core';
import type { ExecuteRequest } from '@ai-pass/runtime-core';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as ExecuteRequest;
    const engine = getExecutionEngine();
    const { execution } = await engine.execute(body);
    return NextResponse.json({ execution });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Execute failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
