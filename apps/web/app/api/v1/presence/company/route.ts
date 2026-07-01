import { defaultPresenceAuditPlatform, parseTenantId } from '@ai-pass/presence-audit/api';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const tenantId = parseTenantId(request.headers);
  const body = (await request.json()) as {
    name: string;
    website: string;
    industry: string;
    products?: string[];
    services?: string[];
    countries?: string[];
    competitors?: string[];
    keywords?: string[];
    brandDescription?: string;
    valueProposition?: string;
  };

  if (!body.name || !body.website) {
    return NextResponse.json({ error: 'name and website required' }, { status: 400 });
  }

  const company = defaultPresenceAuditPlatform.upsertCompany(tenantId, {
    name: body.name,
    website: body.website,
    industry: body.industry ?? 'Technology',
    products: body.products ?? [],
    services: body.services ?? [],
    countries: body.countries ?? [],
    competitors: body.competitors ?? [],
    keywords: body.keywords ?? [],
    brandDescription: body.brandDescription ?? '',
    valueProposition: body.valueProposition ?? '',
  });

  return NextResponse.json({ company });
}

export async function GET(request: Request) {
  const tenantId = parseTenantId(request.headers);
  const company = defaultPresenceAuditPlatform.companies.getByTenant(tenantId);
  if (!company) {
    return NextResponse.json({ company: null });
  }
  return NextResponse.json({ company });
}
