import { createId } from '@ai-pass/shared';
import type { AuditLog } from '@ai-pass/shared';

export class AuditService {
  private logs: AuditLog[] = [];

  record(params: Omit<AuditLog, 'id' | 'immutable' | 'timestamp'>): AuditLog {
    const entry: AuditLog = {
      ...params,
      id: `aud_${createId()}`,
      immutable: true,
      timestamp: new Date().toISOString(),
    };
    this.logs.push(entry);
    return entry;
  }

  list(filters?: { resourceType?: AuditLog['resourceType']; resourceId?: string; limit?: number }): AuditLog[] {
    let result = [...this.logs].reverse();
    if (filters?.resourceType) result = result.filter((l) => l.resourceType === filters.resourceType);
    if (filters?.resourceId) result = result.filter((l) => l.resourceId === filters.resourceId);
    if (filters?.limit) result = result.slice(0, filters.limit);
    return result;
  }

  get(logId: string): AuditLog | undefined {
    return this.logs.find((l) => l.id === logId);
  }
}
