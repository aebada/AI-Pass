import { defaultPresenceAuditPlatform, parseTenantId } from '@ai-pass/presence-audit/api';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const tenantId = parseTenantId(request.headers);
  const body = (await request.json()) as {
    companyId?: string;
    scenario?: 'landing_page' | 'faq' | 'structured_data' | 'positioning';
    input?: Record<string, unknown>;
  };

  const company =
    (body.companyId ? defaultPresenceAuditPlatform.companies.get(body.companyId) : undefined) ??
    defaultPresenceAuditPlatform.companies.getByTenant(tenantId);

  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  }

  const recommendations = defaultPresenceAuditPlatform.getRecommendations(company.id);
  const scenario = body.scenario ?? 'landing_page';

  const simulation = defaultPresenceAuditPlatform.simulation.simulate(
    company,
    scenario,
    body.input ?? { topic: company.industry },
  );

  return NextResponse.json({ recommendations, simulation });
}

export async function GET(request: Request) {
  const tenantId = parseTenantId(request.headers);
  const company = defaultPresenceAuditPlatform.companies.getByTenant(tenantId);
  if (!company) {
    return NextResponse.json({ recommendations: [], simulations: [] });
  }
  return NextResponse.json({
    recommendations: defaultPresenceAuditPlatform.getRecommendations(company.id),
    simulations: defaultPresenceAuditPlatform.simulation.list(company.id),
  });
}
