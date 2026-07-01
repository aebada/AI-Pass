import { defaultPresenceAuditPlatform, parseTenantId } from '@ai-pass/presence-audit/api';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const tenantId = parseTenantId(request.headers);
  const company = defaultPresenceAuditPlatform.companies.getByTenant(tenantId);
  if (!company) {
    return NextResponse.json({ results: [], audit: null });
  }
  const history = defaultPresenceAuditPlatform.getAuditHistory(company.id);
  const latest = history[history.length - 1];
  return NextResponse.json({
    results: defaultPresenceAuditPlatform.getResults(company.id),
    audit: latest ?? null,
    score: latest?.score ?? null,
    representation: latest?.representation ?? null,
    gaps: latest?.gaps ?? [],
  });
}
