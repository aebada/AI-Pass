import { defaultComplianceAIService, parseTenantId } from '@ai-pass/compliance-ai/api';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const tenantId = parseTenantId(request.headers);
  const url = new URL(request.url);
  const frameworkId = url.searchParams.get('frameworkId') ?? undefined;
  const controls = defaultComplianceAIService.controls.list(tenantId, frameworkId);
  const tasks = defaultComplianceAIService.listTasks(tenantId);
  return NextResponse.json({ controls, tasks, total: controls.length });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      frameworkId?: string;
      controlRef?: string;
      title?: string;
      description?: string;
    };
    if (!body.frameworkId || !body.controlRef || !body.title) {
      return NextResponse.json({ error: 'frameworkId, controlRef, title required' }, { status: 400 });
    }
    const control = defaultComplianceAIService.controls.create({
      tenantId: parseTenantId(request.headers),
      frameworkId: body.frameworkId,
      controlRef: body.controlRef,
      title: body.title,
      description: body.description ?? '',
      ownerId: 'demo-user',
      ownerName: 'Demo User',
    });
    return NextResponse.json({ control });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Create failed' },
      { status: 400 },
    );
  }
}
