import { defaultInvoiceAIService, parseTenantId, parseTier, parseUserId } from '@ai-pass/invoice-ai/api';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get('file') as File | null;
    const tenantId = (form.get('tenantId') as string) ?? parseTenantId(request.headers);

    if (!file) {
      return NextResponse.json({ error: 'file required' }, { status: 400 });
    }

    const result = await defaultInvoiceAIService.upload({
      tenantId,
      userId: parseUserId(request.headers),
      fileName: file.name,
      mimeType: file.type || 'application/pdf',
      tier: parseTier(request.headers),
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upload failed' },
      { status: 403 },
    );
  }
}
