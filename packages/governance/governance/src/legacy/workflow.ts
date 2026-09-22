import { createId, type Approval } from '@ai-pass/shared';

/** @deprecated Use ApprovalService */
export class GovernanceWorkflow {
  private approvals = new Map<string, Approval>();

  requestApproval(params: Omit<Approval, 'id' | 'status' | 'createdAt' | 'type' | 'priority'> & Partial<Pick<Approval, 'type' | 'priority'>>): Approval {
    const request: Approval = {
      type: 'manual',
      priority: 'medium',
      ...params,
      id: `apr_${createId()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.approvals.set(request.id, request);
    return request;
  }

  resolve(approvalId: string, status: 'approved' | 'rejected' | 'escalated'): Approval | undefined {
    const req = this.approvals.get(approvalId);
    if (!req) return undefined;
    const updated = { ...req, status, resolvedAt: new Date().toISOString() };
    this.approvals.set(approvalId, updated);
    return updated;
  }

  listPending(): Approval[] {
    return [...this.approvals.values()].filter((a) => a.status === 'pending');
  }
}
