import { NextResponse } from 'next/server';
import { getMarketplaceCore } from '@ai-pass/marketplace-core';

export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse> {
  const core = getMarketplaceCore();
  const { skills, total } = core.skillsRuntime.list();
  return NextResponse.json({ skills, total });
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as {
      skillId: string;
      input: Record<string, unknown>;
      tenantId?: string;
      userId?: string;
    };
    const core = getMarketplaceCore();
    const result = core.skillsRuntime.execute({
      skillId: body.skillId,
      input: body.input ?? {},
      tenantId: body.tenantId ?? 'demo-tenant',
      userId: body.userId ?? 'demo-user',
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Skill execution failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
