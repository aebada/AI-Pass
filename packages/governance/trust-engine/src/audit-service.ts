import { createId } from '@ai-pass/shared';
import type { AuditLog } from './types.js';

export class AuditService {
  private logs: AuditLog[] = [];

  record(params: Omit<AuditLog, 'id' | 'timestamp' | 'immutableHash'>): AuditLog {
    const timestamp = new Date().toISOString();
    const entry: AuditLog = {
      ...params,
      id: `aud_${createId()}`,
      timestamp,
      immutableHash: this.hash(`${params.actorId}:${params.action}:${params.resourceId}:${timestamp}`),
    };
    this.logs.push(entry);
    return entry;
  }

  list(filters?: { resourceType?: AuditLog['resourceType']; resourceId?: string }): AuditLog[] {
    let results = [...this.logs];
    if (filters?.resourceType) results = results.filter((l) => l.resourceType === filters.resourceType);
    if (filters?.resourceId) results = results.filter((l) => l.resourceId === filters.resourceId);
    return results.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  verifyIntegrity(logId: string): boolean {
    const log = this.logs.find((l) => l.id === logId);
    if (!log) return false;
    const expected = this.hash(`${log.actorId}:${log.action}:${log.resourceId}:${log.timestamp}`);
    return log.immutableHash === expected;
  }

  private hash(input: string): string {
    let h = 0;
    for (let i = 0; i < input.length; i++) {
      h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
    }
    return `sha256-stub-${Math.abs(h).toString(16).padStart(8, '0')}`;
  }
}
