import { createId } from '@ai-pass/shared';
import type { ScAuditLog } from '../types.js';

export class AuditService {
  private logs: ScAuditLog[] = [];

  log(entry: Omit<ScAuditLog, 'id' | 'timestamp'>): ScAuditLog {
    const log: ScAuditLog = {
      ...entry,
      id: `aud_${createId()}`,
      timestamp: new Date().toISOString(),
    };
    this.logs.unshift(log);
    return log;
  }

  list(tenantId: string, entityType?: ScAuditLog['entityType']): ScAuditLog[] {
    return this.logs.filter(
      (l) => l.tenantId === tenantId && (!entityType || l.entityType === entityType),
    );
  }

  seed(logs: ScAuditLog[]): void {
    this.logs = [...logs, ...this.logs];
  }
}
