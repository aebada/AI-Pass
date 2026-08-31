import { createId, type DataClassification, type LineageRecord } from '@ai-pass/shared';

export interface GovernanceCheck {
  allowed: boolean;
  reason?: string;
  trustScore: number;
  classification: DataClassification;
  piiDetected: boolean;
}

export interface ApprovalRequest {
  id: string;
  entityType: string;
  entityId: string;
  requestedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

/** Governance — RBAC, lineage, ownership, versioning, retention, audit, trust, PII stubs */
export class GovernanceService {
  private lineage: LineageRecord[] = [];
  private approvals: ApprovalRequest[] = [];
  private auditLog: { action: string; actorId?: string; entityId: string; timestamp: string }[] = [];
  private retentionDays = 365;

  recordLineage(params: Omit<LineageRecord, 'id' | 'timestamp'>): LineageRecord {
    const record: LineageRecord = {
      ...params,
      id: `lin_${createId()}`,
      timestamp: new Date().toISOString(),
    };
    this.lineage.push(record);
    return record;
  }

  getLineage(entityId: string): LineageRecord[] {
    return this.lineage.filter((l) => l.entityId === entityId || l.parentIds.includes(entityId));
  }

  checkAccess(params: { userId: string; roles: string[]; sourceRoles: string[] }): boolean {
    return params.sourceRoles.some((r) => params.roles.includes(r) || params.roles.includes('admin'));
  }

  classifyContent(content: string): { classification: DataClassification; piiDetected: boolean } {
    const piiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/,
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
      /\b\d{16}\b/,
    ];
    const piiDetected = piiPatterns.some((p) => p.test(content));
    const classification: DataClassification = piiDetected
      ? 'pii'
      : content.toLowerCase().includes('confidential')
        ? 'confidential'
        : 'internal';
    return { classification, piiDetected };
  }

  evaluateTrust(params: { freshnessHours: number; sourceTrust: number; chunkCount: number }): number {
    const freshnessBonus = params.freshnessHours < 24 ? 0.1 : params.freshnessHours < 168 ? 0.05 : 0;
    const volumeBonus = Math.min(params.chunkCount / 100, 0.1);
    return Math.min(params.sourceTrust + freshnessBonus + volumeBonus, 1);
  }

  governanceCheck(content: string, accessRoles: string[], userRoles: string[]): GovernanceCheck {
    const access = this.checkAccess({ userId: '', roles: userRoles, sourceRoles: accessRoles });
    const { classification, piiDetected } = this.classifyContent(content);
    const trustScore = this.evaluateTrust({ freshnessHours: 12, sourceTrust: 0.85, chunkCount: 50 });

    return {
      allowed: access && !piiDetected,
      reason: !access ? 'RBAC denied' : piiDetected ? 'PII detected — requires approval' : undefined,
      trustScore,
      classification,
      piiDetected,
    };
  }

  requestApproval(params: Omit<ApprovalRequest, 'id' | 'status' | 'createdAt'>): ApprovalRequest {
    const req: ApprovalRequest = {
      ...params,
      id: `apr_${createId()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.approvals.push(req);
    return req;
  }

  listApprovals(status?: ApprovalRequest['status']): ApprovalRequest[] {
    return status ? this.approvals.filter((a) => a.status === status) : [...this.approvals];
  }

  audit(action: string, entityId: string, actorId?: string): void {
    this.auditLog.push({ action, entityId, actorId, timestamp: new Date().toISOString() });
  }

  getAuditLog(): typeof this.auditLog {
    return [...this.auditLog];
  }

  getRetentionPolicy() {
    return {
      retentionDays: this.retentionDays,
      gdprCompliant: true,
      dataClassificationEnabled: true,
      piiDetection: 'stub',
    };
  }
}
