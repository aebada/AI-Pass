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
  const frameworks = defaultComplianceAIService.frameworks.list(tenantId);
  const catalog = defaultComplianceAIService.frameworks.listCatalog();
  return NextResponse.json({ frameworks, catalog, total: frameworks.length });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { frameworkCode?: string; targetCertificationDate?: string };
    if (!body.frameworkCode) {
      return NextResponse.json({ error: 'frameworkCode required' }, { status: 400 });
    }
    const framework = await defaultComplianceAIService.frameworks.activate({
      tenantId: parseTenantId(request.headers),
      code: body.frameworkCode as 'ISO_27001',
      ownerId: parseUserId(request.headers),
      ownerName: parseUserName(request.headers),
      tier: parseTier(request.headers),
      targetCertificationDate: body.targetCertificationDate,
    });
    return NextResponse.json({ framework });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Activation failed' },
      { status: 400 },
    );
  }
}
