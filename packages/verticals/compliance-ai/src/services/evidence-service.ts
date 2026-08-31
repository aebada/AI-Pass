import type { Evidence } from '../types.js';
import { emitEvidenceExpiring } from '../livesync.js';
import { defaultWorkflowIntegration } from '../workflow-integration.js';
import { ComplianceStore, newId } from './store.js';
import type { AuditService } from './audit-service.js';

export class EvidenceService {
  constructor(
    private store: ComplianceStore,
    private audit: AuditService,
  ) {}

  list(tenantId: string, controlId?: string): Evidence[] {
    return this.store.listByTenant(this.store.evidence, tenantId).filter(
      (e) => !controlId || e.controlIds.includes(controlId),
    );
  }

  get(id: string): Evidence | undefined {
    return this.store.evidence.get(id);
  }

  async upload(params: {
    tenantId: string;
    title: string;
    type: Evidence['type'];
    controlIds?: string[];
    fileName?: string;
    uploadedBy: string;
    actorName: string;
  }): Promise<Evidence> {
    const now = new Date().toISOString();
    const evidence: Evidence = {
      id: newId('ev'),
      tenantId: params.tenantId,
      title: params.title,
      type: params.type,
      status: 'collected',
      controlIds: params.controlIds ?? [],
      frameworkCodes: [],
      source: 'manual',
      fileName: params.fileName,
      collectedAt: now,
      uploadedBy: params.uploadedBy,
      createdAt: now,
      updatedAt: now,
    };
    this.store.evidence.set(evidence.id, evidence);
    this.audit.log({
      tenantId: params.tenantId,
      entityType: 'evidence',
      entityId: evidence.id,
      action: 'evidence.uploaded',
      actorId: params.uploadedBy,
      actorName: params.actorName,
      details: { title: params.title, type: params.type },
    });
    if (params.controlIds?.[0]) {
      await defaultWorkflowIntegration.triggerEvidenceCollection(params.controlIds[0], params.tenantId);
    }
    return evidence;
  }

  /** Auto-collection stub — integrates with cloud providers via workflow */
  async autoCollect(params: {
    tenantId: string;
    controlId: string;
    source: 'api_integration' | 'workflow';
    title: string;
  }): Promise<Evidence> {
    return this.upload({
      tenantId: params.tenantId,
      title: params.title,
      type: 'log',
      controlIds: [params.controlId],
      uploadedBy: 'system',
      actorName: 'Auto Collector',
    });
  }

  async checkExpiring(tenantId: string): Promise<Evidence[]> {
    const now = Date.now();
    const expiring = this.list(tenantId).filter((e) => {
      if (!e.expiresAt) return false;
      const days = (new Date(e.expiresAt).getTime() - now) / 86400000;
      return days > 0 && days <= 30;
    });
    for (const e of expiring) {
      await emitEvidenceExpiring(e);
    }
    return expiring;
  }

  getStatusSummary(tenantId: string): { collected: number; pending: number; validated: number; expired: number } {
    const items = this.list(tenantId);
    return {
      collected: items.filter((e) => e.status === 'collected').length,
      pending: items.filter((e) => e.status === 'pending').length,
      validated: items.filter((e) => e.status === 'validated').length,
      expired: items.filter((e) => e.status === 'expired').length,
    };
  }
}
