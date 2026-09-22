import { createId } from '@ai-pass/shared';
import type { Approval, Invoice } from '@ai-pass/shared/invoice-ai';

export interface ApprovalMatrix {
  under_1000?: string;
  over_1000?: string;
  over_5000?: string;
  all?: string;
}

export class ApprovalEngine {
  route(invoice: Invoice, matrix: ApprovalMatrix = { under_1000: 'auto', over_1000: 'manager' }): Approval[] {
    const approvals: Approval[] = [];

    if (invoice.amount <= 1000 && matrix.under_1000 === 'auto') {
      return approvals;
    }

    const level = invoice.amount > 5000 ? 2 : 1;
    const approverName = level === 2 ? 'David Park (CFO)' : 'Sarah Chen (Finance Manager)';
    const approverId = level === 2 ? 'user_cfo' : 'user_finance_mgr';

    approvals.push({
      id: `appr_${createId()}`,
      invoiceId: invoice.id,
      tenantId: invoice.tenantId,
      approverId,
      approverName,
      level,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    });

    return approvals;
  }

  approve(approval: Approval, comment?: string): Approval {
    return {
      ...approval,
      status: 'approved',
      comment,
      decidedAt: new Date().toISOString(),
    };
  }

  reject(approval: Approval, reason: string): Approval {
    return {
      ...approval,
      status: 'rejected',
      comment: reason,
      decidedAt: new Date().toISOString(),
    };
  }
}
