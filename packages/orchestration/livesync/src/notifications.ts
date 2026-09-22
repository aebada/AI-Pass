import { createId, type NotificationRecord } from '@ai-pass/shared';
import type { LiveSyncChannelBus } from './channels.js';
import type { ExecutionLogger } from './logging.js';

export type NotificationChannel = NotificationRecord['channel'];

export interface NotificationRequest {
  channel: NotificationChannel;
  recipient: string;
  subject?: string;
  body: string;
  eventId?: string;
  metadata?: Record<string, unknown>;
}

export class NotificationEngine {
  private records: NotificationRecord[] = [];

  constructor(
    private logger: ExecutionLogger,
    private channels?: LiveSyncChannelBus
  ) {}

  async send(request: NotificationRequest): Promise<NotificationRecord> {
    const record: NotificationRecord = {
      id: `ntf_${createId()}`,
      event_id: request.eventId,
      channel: request.channel,
      recipient: request.recipient,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    try {
      await this.dispatchStub(request);
      record.status = 'sent';
      record.sent_at = new Date().toISOString();
      this.logger.info('system', record.id, `Notification sent via ${request.channel}`, {
        recipient: request.recipient,
        event_id: request.eventId,
      });
      this.channels?.publish('notification.sent', record);
    } catch (err) {
      record.status = 'failed';
      record.error = err instanceof Error ? err.message : 'Notification failed';
      this.logger.error('system', record.id, record.error);
    }

    this.records.push(record);
    return record;
  }

  async sendMulti(requests: NotificationRequest[]): Promise<NotificationRecord[]> {
    return Promise.all(requests.map((r) => this.send(r)));
  }

  list(filters?: { eventId?: string; channel?: NotificationChannel; limit?: number }) {
    let items = [...this.records];
    if (filters?.eventId) items = items.filter((r) => r.event_id === filters.eventId);
    if (filters?.channel) items = items.filter((r) => r.channel === filters.channel);
    if (filters?.limit) items = items.slice(-filters.limit);
    return items;
  }

  private async dispatchStub(request: NotificationRequest): Promise<void> {
    switch (request.channel) {
      case 'email':
      case 'sms':
      case 'push':
      case 'slack':
      case 'teams':
      case 'webhook':
      case 'voice':
        return;
      default:
        throw new Error(`Unsupported channel: ${request.channel}`);
    }
  }
}
