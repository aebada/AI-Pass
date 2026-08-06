import { defaultPresenceAuditPlatform, parseTenantId } from '@ai-pass/presence-audit/api';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const tenantId = parseTenantId(request.headers);
  const company = defaultPresenceAuditPlatform.companies.getByTenant(tenantId);
  if (!company) {
    return NextResponse.json({ reports: [] });
  }
  return NextResponse.json({ reports: defaultPresenceAuditPlatform.getReports(company.id) });
}
