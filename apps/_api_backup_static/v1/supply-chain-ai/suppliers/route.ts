import { NextResponse } from 'next/server';
import { defaultSupplyChainAIService, parseTenantId } from '@ai-pass/supply-chain-ai';

export async function GET(request: Request) {
  const tenantId = parseTenantId(request.headers);
  const data = defaultSupplyChainAIService.listSuppliers(tenantId);
  return NextResponse.json(data);
}
