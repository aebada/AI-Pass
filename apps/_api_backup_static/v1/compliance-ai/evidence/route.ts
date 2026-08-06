import {
  defaultComplianceAIService,
  parseTenantId,
  parseUserId,
  parseUserName,
} from '@ai-pass/compliance-ai/api';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const tenantId = parseTenantId(request.headers);
  const url = new URL(request.url);
  const controlId = url.searchParams.get('controlId') ?? undefined;
  const evidence = defaultComplianceAIService.evidence.list(tenantId, controlId);
  const summary = defaultComplianceAIService.evidence.getStatusSummary(tenantId);
  return NextResponse.json({ evidence, summary, total: evidence.length });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      title?: string;
      type?: string;
      controlIds?: string[];
      fileName?: string;
    };
    if (!body.title || !body.type) {
      return NextResponse.json({ error: 'title, type required' }, { status: 400 });
    }
    const item = await defaultComplianceAIService.evidence.upload({
      tenantId: parseTenantId(request.headers),
      title: body.title,
      type: body.type as 'document',
      controlIds: body.controlIds,
      fileName: body.fileName,
      uploadedBy: parseUserId(request.headers),
      actorName: parseUserName(request.headers),
    });
    return NextResponse.json({ evidence: item });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upload failed' },
      { status: 400 },
    );
  }
}
