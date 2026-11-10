import { createId } from '@ai-pass/shared';
import type { AuditLog } from '../types.js';

export class AuditService {
  private logs: AuditLog[] = [];

  constructor(seedLogs: AuditLog[] = []) {
    this.logs = [...seedLogs];
  }

  log(params: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const entry: AuditLog = {
      ...params,
      id: `aud_${createId()}`,
      timestamp: new Date().toISOString(),
    };
    this.logs.push(entry);
    return entry;
  }

  list(tenantId: string, entityType?: string): AuditLog[] {
    return this.logs
      .filter((l) => l.tenantId === tenantId && (!entityType || l.entityType === entityType))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  getByEntity(entityId: string): AuditLog[] {
    return this.logs.filter((l) => l.entityId === entityId);
  }
}
