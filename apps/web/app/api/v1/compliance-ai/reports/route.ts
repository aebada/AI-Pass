import { defaultComplianceAIService, parseTenantId, parseTier } from '@ai-pass/compliance-ai/api';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const tenantId = parseTenantId(request.headers);
  const url = new URL(request.url);
  const type = url.searchParams.get('type') ?? undefined;
  const tier = parseTier(request.headers);

  if (type) {
    try {
      const report = defaultComplianceAIService.reporting.generate({
        tenantId,
        type: type as 'compliance_summary',
        tier,
      });
      return NextResponse.json({ report });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Report failed' },
        { status: 403 },
      );
    }
  }

  const reports = defaultComplianceAIService.reporting.list(tenantId);
  const dashboard = defaultComplianceAIService.getDashboard(tenantId);
  return NextResponse.json({ reports, dashboard: dashboard.dashboard, total: reports.length });
}
