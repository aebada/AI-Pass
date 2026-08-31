import { createId } from '@ai-pass/shared';
import type { OutreachChannel } from '../types.js';

export interface OutreachMessage {
  id: string;
  channel: OutreachChannel;
  recipient: string;
  content: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'stubbed';
  sentAt?: string;
  stubbed: boolean;
}

/** Outreach via email, LinkedIn, WhatsApp, SMS, Teams, Slack (stubs) */
export class OutreachService {
  private messages: OutreachMessage[] = [];

  async send(params: {
    channel: OutreachChannel;
    recipient: string;
    content: string;
    subject?: string;
  }): Promise<OutreachMessage> {
    const stubbed = params.channel !== 'email';

    const message: OutreachMessage = {
      id: `out_${createId()}`,
      channel: params.channel,
      recipient: params.recipient,
      content: params.content,
      status: stubbed ? 'stubbed' : 'sent',
      sentAt: new Date().toISOString(),
      stubbed,
    };

    this.messages.push(message);
    return message;
  }

  list(): OutreachMessage[] {
    return [...this.messages];
  }

  getChannelStatus(channel: OutreachChannel): { available: boolean; stubbed: boolean } {
    const stubbedChannels: OutreachChannel[] = ['whatsapp', 'sms', 'teams', 'slack'];
    return {
      available: true,
      stubbed: stubbedChannels.includes(channel) || channel === 'linkedin',
    };
  }
}
