import { defaultPresenceAuditPlatform, parseTenantId } from '@ai-pass/presence-audit/api';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const tenantId = parseTenantId(request.headers);
  const dashboard = defaultPresenceAuditPlatform.getDashboard(tenantId);
  if (!dashboard) {
    return NextResponse.json({ dashboard: null });
  }
  const company = dashboard.company;
  const analytics = defaultPresenceAuditPlatform.analytics.compute(
    company.id,
    defaultPresenceAuditPlatform.getAuditHistory(company.id),
    defaultPresenceAuditPlatform.getRecommendations(company.id),
  );
  return NextResponse.json({ dashboard, analytics });
}
