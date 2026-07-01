import {
  defaultComplianceAIService,
  parseTenantId,
  parseUserId,
  parseUserName,
} from '@ai-pass/compliance-ai/api';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const tenantId = parseTenantId(request.headers);
  const policies = defaultComplianceAIService.policies.list(tenantId);
  const templates = defaultComplianceAIService.policies.getTemplates();
  return NextResponse.json({ policies, templates, total: policies.length });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      title?: string;
      content?: string;
      templateType?: string;
    };
    if (!body.title || !body.content) {
      return NextResponse.json({ error: 'title, content required' }, { status: 400 });
    }
    const policy = await defaultComplianceAIService.policies.create({
      tenantId: parseTenantId(request.headers),
      title: body.title,
      content: body.content,
      templateType: body.templateType as 'security' | undefined,
      ownerId: parseUserId(request.headers),
      ownerName: parseUserName(request.headers),
    });
    return NextResponse.json({ policy });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Create failed' },
      { status: 400 },
    );
  }
}
