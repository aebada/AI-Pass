import {
  defaultComplianceAIService,
  parseTenantId,
  parseTier,
  parseUserId,
  parseUserName,
} from '@ai-pass/compliance-ai/api';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { orgSlug?: string; orgName?: string };
    if (!body.orgSlug || !body.orgName) {
      return NextResponse.json({ error: 'orgSlug, orgName required' }, { status: 400 });
    }
    const result = await defaultComplianceAIService.trustCenter.publish({
      tenantId: parseTenantId(request.headers),
      orgSlug: body.orgSlug,
      orgName: body.orgName,
      actorId: parseUserId(request.headers),
      actorName: parseUserName(request.headers),
      tier: parseTier(request.headers),
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Publish failed' },
      { status: 400 },
    );
  }
}
