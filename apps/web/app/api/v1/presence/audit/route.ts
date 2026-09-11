import { defaultPresenceAuditPlatform, parseTenantId, parseTier, parseUserId } from '@ai-pass/presence-audit/api';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const tenantId = parseTenantId(request.headers);
  const body = (await request.json()) as { companyId?: string };
  const company =
    (body.companyId ? defaultPresenceAuditPlatform.companies.get(body.companyId) : undefined) ??
    defaultPresenceAuditPlatform.companies.getByTenant(tenantId);

  if (!company) {
    return NextResponse.json({ error: 'Company not found - create company profile first' }, { status: 404 });
  }

  try {
    const audit = await defaultPresenceAuditPlatform.runAudit({
      companyId: company.id,
      userId: parseUserId(request.headers),
      membershipTier: parseTier(request.headers),
    });
    return NextResponse.json({ audit });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Audit failed' },
      { status: 500 },
    );
  }
}
