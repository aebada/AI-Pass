import { defaultPresenceAuditPlatform, parseTenantId } from '@ai-pass/presence-audit/api';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const tenantId = parseTenantId(request.headers);
  const body = (await request.json()) as { companyId?: string; name: string };

  const company =
    (body.companyId ? defaultPresenceAuditPlatform.companies.get(body.companyId) : undefined) ??
    defaultPresenceAuditPlatform.companies.getByTenant(tenantId);

  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  }

  const updated = defaultPresenceAuditPlatform.addCompetitor(company.id, body.name);
  const latest = defaultPresenceAuditPlatform.getAuditHistory(company.id).slice(-1)[0];

  return NextResponse.json({
    company: updated,
    competitors: latest?.competitorSnapshot ?? defaultPresenceAuditPlatform.competitors.analyze(company, []),
  });
}

export async function GET(request: Request) {
  const tenantId = parseTenantId(request.headers);
  const company = defaultPresenceAuditPlatform.companies.getByTenant(tenantId);
  if (!company) {
    return NextResponse.json({ competitors: [] });
  }
  const latest = defaultPresenceAuditPlatform.getAuditHistory(company.id).slice(-1)[0];
  return NextResponse.json({
    competitors: latest?.competitorSnapshot ?? [],
    comparison: defaultPresenceAuditPlatform.competitors.compare(
      company,
      latest?.competitorSnapshot ?? [],
    ),
  });
}
