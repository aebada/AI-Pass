import { NextResponse } from 'next/server';
import { defaultSupplyChainAIService, parseTenantId, parseUserId, parseTier } from '@ai-pass/supply-chain-ai';

export async function GET(request: Request) {
  const tenantId = parseTenantId(request.headers);
  const url = new URL(request.url);
  const eventId = url.searchParams.get('eventId') ?? undefined;
  const offers = defaultSupplyChainAIService.listOffers(eventId ?? undefined, tenantId);
  return NextResponse.json({ offers, total: offers.length });
}

export async function POST(request: Request) {
  try {
    const tenantId = parseTenantId(request.headers);
    const userId = parseUserId(request.headers);
    const tier = parseTier(request.headers);
    const body = await request.json();
    const result = await defaultSupplyChainAIService.uploadOffer({
      tenantId,
      userId,
      tier,
      eventId: body.eventId,
      fileName: body.fileName,
      mimeType: body.mimeType,
      supplierId: body.supplierId,
      supplierName: body.supplierName,
      manualFields: body.manualFields,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 400 });
  }
}
