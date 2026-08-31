import type { Audit } from '../types.js';
import { ComplianceStore, hashAudit, newId } from './store.js';

export class AuditService {
  constructor(private store: ComplianceStore) {}

  list(tenantId: string, entityType?: string): Audit[] {
    return this.store.audits
      .filter((a) => a.tenantId === tenantId && (!entityType || a.entityType === entityType))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  get(id: string): Audit | undefined {
    return this.store.audits.find((a) => a.id === id);
  }

  log(params: Omit<Audit, 'id' | 'immutableHash' | 'timestamp'>): Audit {
    const entry: Audit = {
      ...params,
      id: newId('aud'),
      immutableHash: hashAudit(params.details),
      timestamp: new Date().toISOString(),
    };
    this.store.audits.push(entry);
    return entry;
  }
}
