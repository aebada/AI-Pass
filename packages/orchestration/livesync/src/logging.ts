import { createId, type ExecutionLog, type LogLevel } from '@ai-pass/shared';
import type { LiveSyncStore } from './types.js';

export class ExecutionLogger {
  constructor(private store: LiveSyncStore) {}

  log(
    level: LogLevel,
    executionType: ExecutionLog['execution_type'],
    referenceId: string,
    message: string,
    metadata?: Record<string, unknown>
  ): ExecutionLog {
    const entry: ExecutionLog = {
      id: `log_${createId()}`,
      execution_type: executionType,
      reference_id: referenceId,
      level,
      message,
      metadata_json: metadata,
      created_at: new Date().toISOString(),
    };
    this.store.logs.push(entry);
    return entry;
  }

  info(
    executionType: ExecutionLog['execution_type'],
    referenceId: string,
    message: string,
    metadata?: Record<string, unknown>
  ): ExecutionLog {
    return this.log('info', executionType, referenceId, message, metadata);
  }

  warn(
    executionType: ExecutionLog['execution_type'],
    referenceId: string,
    message: string,
    metadata?: Record<string, unknown>
  ): ExecutionLog {
    return this.log('warn', executionType, referenceId, message, metadata);
  }

  error(
    executionType: ExecutionLog['execution_type'],
    referenceId: string,
    message: string,
    metadata?: Record<string, unknown>
  ): ExecutionLog {
    return this.log('error', executionType, referenceId, message, metadata);
  }

  getLogs(filters?: {
    eventId?: string;
    executionId?: string;
    level?: LogLevel;
    limit?: number;
  }): ExecutionLog[] {
    let logs = [...this.store.logs];

    if (filters?.eventId) {
      logs = logs.filter(
        (l) =>
          l.reference_id === filters.eventId ||
          l.metadata_json?.event_id === filters.eventId
      );
    }

    if (filters?.executionId) {
      logs = logs.filter((l) => l.reference_id === filters.executionId);
    }

    if (filters?.level) {
      logs = logs.filter((l) => l.level === filters.level);
    }

    logs.sort((a, b) => a.created_at.localeCompare(b.created_at));

    if (filters?.limit) {
      logs = logs.slice(-filters.limit);
    }

    return logs;
  }
}
