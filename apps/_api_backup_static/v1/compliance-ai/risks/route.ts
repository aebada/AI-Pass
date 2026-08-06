import {
  defaultComplianceAIService,
  parseTenantId,
  parseTier,
  parseUserId,
  parseUserName,
} from '@ai-pass/compliance-ai/api';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const tenantId = parseTenantId(request.headers);
  const url = new URL(request.url);
  const category = url.searchParams.get('category') ?? undefined;
  const risks = defaultComplianceAIService.risks.list(
    tenantId,
    category as 'security' | undefined,
  );
  return NextResponse.json({ risks, total: risks.length });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      title?: string;
      description?: string;
      category?: string;
      severity?: string;
      likelihood?: number;
      impact?: number;
    };
    if (!body.title || !body.category || !body.severity) {
      return NextResponse.json({ error: 'title, category, severity required' }, { status: 400 });
    }
    const risk = await defaultComplianceAIService.risks.create({
      tenantId: parseTenantId(request.headers),
      title: body.title,
      description: body.description ?? '',
      category: body.category as 'security',
      severity: body.severity as 'high',
      likelihood: body.likelihood ?? 3,
      impact: body.impact ?? 3,
      ownerId: parseUserId(request.headers),
      ownerName: parseUserName(request.headers),
      tier: parseTier(request.headers),
    });
    return NextResponse.json({ risk });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Create failed' },
      { status: 400 },
    );
  }
}
