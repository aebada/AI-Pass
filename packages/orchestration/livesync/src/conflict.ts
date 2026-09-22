import type { LiveSyncEvent } from '@ai-pass/shared';

export type ConflictResolution = 'reject_duplicate' | 'queue_sequential' | 'merge_latest';

export interface ConflictResult {
  action: 'accept' | 'reject' | 'defer';
  reason?: string;
  existingEventId?: string;
}

/**
 * MVP conflict strategy: reject duplicate event IDs, serialize by event type.
 * Prevents double-processing when webhooks retry with the same idempotency key.
 */
export class ConflictResolver {
  private processingTypes = new Set<string>();
  private seenIdempotencyKeys = new Map<string, string>();

  check(
    event: LiveSyncEvent,
    idempotencyKey?: string,
    strategy: ConflictResolution = 'queue_sequential'
  ): ConflictResult {
    if (idempotencyKey) {
      const existing = this.seenIdempotencyKeys.get(idempotencyKey);
      if (existing) {
        return {
          action: 'reject',
          reason: 'Duplicate idempotency key',
          existingEventId: existing,
        };
      }
      this.seenIdempotencyKeys.set(idempotencyKey, event.id);
    }

    if (strategy === 'queue_sequential' && this.processingTypes.has(event.event_type)) {
      return {
        action: 'defer',
        reason: `Another ${event.event_type} event is processing`,
      };
    }

    return { action: 'accept' };
  }

  markProcessing(eventType: string): void {
    this.processingTypes.add(eventType);
  }

  markComplete(eventType: string): void {
    this.processingTypes.delete(eventType);
  }
}
