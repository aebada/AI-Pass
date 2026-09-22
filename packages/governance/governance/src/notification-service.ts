import type { GovernanceEventType } from '@ai-pass/shared';

export interface NotificationPayload {
  channel: 'email' | 'slack' | 'in_app' | 'webhook';
  recipientId: string;
  subject: string;
  body: string;
  eventType: GovernanceEventType;
  metadata?: Record<string, unknown>;
}

export interface NotificationResult {
  id: string;
  status: 'queued' | 'sent' | 'failed';
  channel: NotificationPayload['channel'];
}

/** Stub — wire to real notification providers in production */
export class NotificationService {
  private queue: NotificationResult[] = [];

  send(payload: NotificationPayload): NotificationResult {
    const result: NotificationResult = {
      id: `ntf_${Date.now()}`,
      status: 'queued',
      channel: payload.channel,
    };
    this.queue.push(result);
    return result;
  }

  listQueued(): NotificationResult[] {
    return [...this.queue];
  }
}
