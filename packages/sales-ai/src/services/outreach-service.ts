import { createId } from '@ai-pass/shared';
import { getWhatsAppCloudClient } from '@ai-pass/messaging-connectors';
import type { OutreachChannel } from '../types.js';

export interface OutreachMessage {
  id: string;
  channel: OutreachChannel;
  recipient: string;
  content: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'stubbed';
  sentAt?: string;
  stubbed: boolean;
  externalId?: string;
}

/** Outreach via email, LinkedIn, WhatsApp, SMS, Teams, Slack */
export class OutreachService {
  private messages: OutreachMessage[] = [];

  async send(params: {
    channel: OutreachChannel;
    recipient: string;
    content: string;
    subject?: string;
  }): Promise<OutreachMessage> {
    if (params.channel === 'whatsapp') {
      const client = getWhatsAppCloudClient();
      const result = await client.sendText({
        to: params.recipient,
        body: params.content,
      });
      const message: OutreachMessage = {
        id: `out_${createId()}`,
        channel: 'whatsapp',
        recipient: params.recipient,
        content: params.content,
        status: result.success ? (result.stubbed ? 'stubbed' : 'sent') : 'failed',
        sentAt: new Date().toISOString(),
        stubbed: result.stubbed,
        externalId: result.externalId,
      };
      this.messages.push(message);
      return message;
    }

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
    if (channel === 'whatsapp') {
      const configured = getWhatsAppCloudClient().isConfigured();
      return { available: true, stubbed: !configured };
    }
    const stubbedChannels: OutreachChannel[] = ['sms', 'teams', 'slack'];
    return {
      available: true,
      stubbed: stubbedChannels.includes(channel) || channel === 'linkedin',
    };
  }
}
