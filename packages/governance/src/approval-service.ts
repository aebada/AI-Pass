import { createId } from '@ai-pass/shared';
import type { Approval, ApprovalType } from '@ai-pass/shared';

export class ApprovalService {
  private approvals = new Map<string, Approval>();

  request(params: Omit<Approval, 'id' | 'status' | 'createdAt'>): Approval {
    const entry: Approval = {
      ...params,
      id: `apr_${createId()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.approvals.set(entry.id, entry);
    return entry;
  }

  get(approvalId: string): Approval | undefined {
    return this.approvals.get(approvalId);
  }

  list(filters?: { status?: Approval['status']; systemId?: string; type?: ApprovalType }): Approval[] {
    let result = [...this.approvals.values()];
    if (filters?.status) result = result.filter((a) => a.status === filters.status);
    if (filters?.systemId) result = result.filter((a) => a.systemId === filters.systemId);
    if (filters?.type) result = result.filter((a) => a.type === filters.type);
    return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  listPending(): Approval[] {
    return this.list({ status: 'pending' });
  }

  approve(approvalId: string, resolvedBy: string, decision: Approval['decision'] = 'PASS'): Approval | undefined {
    const req = this.approvals.get(approvalId);
    if (!req) return undefined;
    const updated: Approval = {
      ...req,
      status: 'approved',
      decision,
      resolvedBy,
      resolvedAt: new Date().toISOString(),
    };
    this.approvals.set(approvalId, updated);
    return updated;
  }

  reject(approvalId: string, resolvedBy: string, decision: Approval['decision'] = 'FAIL'): Approval | undefined {
    const req = this.approvals.get(approvalId);
    if (!req) return undefined;
    const updated: Approval = {
      ...req,
      status: 'rejected',
      decision,
      resolvedBy,
      resolvedAt: new Date().toISOString(),
    };
    this.approvals.set(approvalId, updated);
    return updated;
  }

  escalate(approvalId: string, escalatedTo: string): Approval | undefined {
    const req = this.approvals.get(approvalId);
    if (!req) return undefined;
    const updated: Approval = { ...req, status: 'escalated', escalatedTo };
    this.approvals.set(approvalId, updated);
    return updated;
  }

  override(approvalId: string, resolvedBy: string, exceptionDetails: string): Approval | undefined {
    const req = this.approvals.get(approvalId);
    if (!req) return undefined;
    const updated: Approval = {
      ...req,
      status: 'overridden',
      resolvedBy,
      exceptionDetails,
      resolvedAt: new Date().toISOString(),
      decision: 'PASS',
    };
    this.approvals.set(approvalId, updated);
    return updated;
  }

  seed(approvals: Approval[]): void {
    for (const a of approvals) this.approvals.set(a.id, a);
  }
}
