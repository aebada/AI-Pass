import { defaultPresenceAuditPlatform, parseTenantId } from '@ai-pass/presence-audit/api';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const tenantId = parseTenantId(request.headers);
  const company = defaultPresenceAuditPlatform.companies.getByTenant(tenantId);
  if (!company) {
    return NextResponse.json({ history: [], alerts: [], events: [] });
  }

  const history = defaultPresenceAuditPlatform.getAuditHistory(company.id);
  const alerts = defaultPresenceAuditPlatform.alerts.list(company.id);
  const events = defaultPresenceAuditPlatform.monitoring.listEvents(company.id);

  return NextResponse.json({ history, alerts, events, schedule: defaultPresenceAuditPlatform.monitoring.getSchedule(company.id) });
}
