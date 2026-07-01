import { jsonOk, jsonError, getGovernance } from '@/src/lib/governance-api';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json() as {
      approvalId: string;
      action: 'approve' | 'reject' | 'escalate' | 'override';
      actorId?: string;
    };
    if (!body.approvalId || !body.action) return jsonError('approvalId and action are required');
    getGovernance().processApproval(body.approvalId, body.action, body.actorId ?? 'demo-user');
    const approval = getGovernance().approvals.get(body.approvalId);
    return jsonOk(approval);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Approval failed');
  }
}

export async function GET(): Promise<Response> {
  return jsonOk(getGovernance().approvals.list());
}
