import { NextResponse } from 'next/server';
import { defaultSupplyChainAIService, parseTenantId } from '@ai-pass/supply-chain-ai';

export async function POST(request: Request) {
  try {
    const tenantId = parseTenantId(request.headers);
    const body = await request.json();
    const result = defaultSupplyChainAIService.processApproval({
      tenantId,
      approvalId: body.approvalId,
      approverId: body.approverId ?? 'demo-approver',
      approverName: body.approverName ?? 'Demo Approver',
      comment: body.comment,
      action: body.action,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const tenantId = parseTenantId(request.headers);
  const url = new URL(request.url);
  const status = url.searchParams.get('status') as 'pending' | 'approved' | 'rejected' | null;
  const approvals = defaultSupplyChainAIService.listApprovals(tenantId, status ?? undefined);
  return NextResponse.json({ approvals });
}
