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
  const vendors = defaultComplianceAIService.vendors.list(tenantId);
  const integrations = defaultComplianceAIService.vendors.listIntegrations();
  return NextResponse.json({ vendors, integrations, total: vendors.length });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      category?: string;
      contactEmail?: string;
      riskClass?: string;
    };
    if (!body.name || !body.category || !body.contactEmail) {
      return NextResponse.json({ error: 'name, category, contactEmail required' }, { status: 400 });
    }
    const vendor = await defaultComplianceAIService.vendors.create({
      tenantId: parseTenantId(request.headers),
      name: body.name,
      category: body.category,
      contactEmail: body.contactEmail,
      riskClass: body.riskClass as 'medium' | undefined,
      actorId: parseUserId(request.headers),
      actorName: parseUserName(request.headers),
    });
    return NextResponse.json({ vendor });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Create failed' },
      { status: 400 },
    );
  }
}
