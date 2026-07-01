import { defaultModuleRegistry, ok } from '@ai-pass/platform-core';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse> {
  const modules = defaultModuleRegistry.list().map((m) => ({
    id: m.id,
    name: m.name,
    route: m.route,
    status: m.status,
    tier: m.tier,
    category: m.category,
  }));

  return NextResponse.json(ok({ modules }));
}
