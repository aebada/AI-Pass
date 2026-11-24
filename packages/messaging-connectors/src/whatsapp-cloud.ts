import { createId } from '@ai-pass/shared';
import type {
  SendResult,
  TwinChannelSession,
  WebhookVerifyResult,
  WhatsAppConfig,
  WhatsAppInboundMessage,
  WhatsAppTextMessage,
} from './types.js';

const DEFAULT_GRAPH = 'v21.0';

function normalizeE164(phone: string): string {
  return phone.replace(/[^\d+]/g, '').replace(/^\+/, '');
}

/** Meta WhatsApp Cloud API — same channel pattern Instinct uses (text the twin). */
export class WhatsAppCloudClient {
  private config: WhatsAppConfig | null = null;
  private sessions = new Map<string, TwinChannelSession>();
  private inbox: WhatsAppInboundMessage[] = [];

  connect(config: WhatsAppConfig): { connected: boolean; stubbed: boolean } {
    this.config = config;
    const stubbed = !config.accessToken || !config.phoneNumberId;
    return { connected: true, stubbed };
  }

  fromEnv(): { connected: boolean; stubbed: boolean; config?: WhatsAppConfig } {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim() ?? '';
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() ?? '';
    const verifyToken =
      process.env.WHATSAPP_VERIFY_TOKEN?.trim() || 'ai-pass-whatsapp-verify';
    const config: WhatsAppConfig = {
      accessToken,
      phoneNumberId,
      verifyToken,
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID?.trim(),
      appSecret: process.env.WHATSAPP_APP_SECRET?.trim(),
      graphVersion: process.env.WHATSAPP_GRAPH_VERSION?.trim() || DEFAULT_GRAPH,
    };
    const result = this.connect(config);
    return { ...result, config };
  }

  isConfigured(): boolean {
    return Boolean(this.config?.accessToken && this.config?.phoneNumberId);
  }

  getStatus(): {
    channel: 'whatsapp';
    configured: boolean;
    phoneNumberId?: string;
    graphVersion: string;
    sessions: number;
    inbox: number;
  } {
    return {
      channel: 'whatsapp',
      configured: this.isConfigured(),
      phoneNumberId: this.config?.phoneNumberId || undefined,
      graphVersion: this.config?.graphVersion || DEFAULT_GRAPH,
      sessions: this.sessions.size,
      inbox: this.inbox.length,
    };
  }

  verifyWebhook(params: {
    mode?: string | null;
    token?: string | null;
    challenge?: string | null;
  }): WebhookVerifyResult {
    const expected = this.config?.verifyToken || process.env.WHATSAPP_VERIFY_TOKEN;
    if (params.mode !== 'subscribe') {
      return { ok: false, reason: 'hub.mode must be subscribe' };
    }
    if (!expected || params.token !== expected) {
      return { ok: false, reason: 'verify token mismatch' };
    }
    if (!params.challenge) {
      return { ok: false, reason: 'missing hub.challenge' };
    }
    return { ok: true, challenge: params.challenge };
  }

  async sendText(message: WhatsAppTextMessage): Promise<SendResult> {
    if (!this.isConfigured() || !this.config) {
      const id = `wa_stub_${createId()}`;
      this.touchSession(message.to);
      return {
        success: true,
        channel: 'whatsapp',
        externalId: id,
        stubbed: true,
        message:
          'WhatsApp not configured — set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID. Message queued as stub.',
      };
    }

    const version = this.config.graphVersion || DEFAULT_GRAPH;
    const url = `https://graph.facebook.com/${version}/${this.config.phoneNumberId}/messages`;
    const payload: Record<string, unknown> = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: normalizeE164(message.to),
      type: 'text',
      text: { preview_url: false, body: message.body },
    };
    if (message.replyToMessageId) {
      payload.context = { message_id: message.replyToMessageId };
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => ({}))) as {
        messages?: { id?: string }[];
        error?: { message?: string };
      };
      if (!res.ok) {
        return {
          success: false,
          channel: 'whatsapp',
          stubbed: false,
          error: json.error?.message || `WhatsApp API ${res.status}`,
        };
      }
      const externalId = json.messages?.[0]?.id || `wa_${createId()}`;
      this.touchSession(message.to);
      return {
        success: true,
        channel: 'whatsapp',
        externalId,
        stubbed: false,
        message: 'Sent via WhatsApp Cloud API',
      };
    } catch (err) {
      return {
        success: false,
        channel: 'whatsapp',
        stubbed: false,
        error: err instanceof Error ? err.message : 'WhatsApp send failed',
      };
    }
  }

  /** Parse Meta Cloud API webhook payload into inbound twin messages. */
  ingestWebhook(body: unknown): WhatsAppInboundMessage[] {
    const parsed: WhatsAppInboundMessage[] = [];
    const root = body as {
      object?: string;
      entry?: {
        changes?: {
          value?: {
            messages?: {
              id?: string;
              from?: string;
              timestamp?: string;
              type?: string;
              text?: { body?: string };
            }[];
          };
        }[];
      }[];
    };

    if (root?.object !== 'whatsapp_business_account' && !root?.entry) {
      return parsed;
    }

    for (const entry of root.entry || []) {
      for (const change of entry.changes || []) {
        for (const msg of change.value?.messages || []) {
          if (!msg.from || !msg.id) continue;
          const inbound: WhatsAppInboundMessage = {
            id: msg.id,
            from: msg.from,
            timestamp: msg.timestamp
              ? new Date(Number(msg.timestamp) * 1000).toISOString()
              : new Date().toISOString(),
            type: msg.type || 'unknown',
            text: msg.text?.body,
            raw: msg,
          };
          parsed.push(inbound);
          this.inbox.unshift(inbound);
          this.touchSession(msg.from);
        }
      }
    }

    if (this.inbox.length > 500) {
      this.inbox.length = 500;
    }
    return parsed;
  }

  listInbox(limit = 50): WhatsAppInboundMessage[] {
    return this.inbox.slice(0, limit);
  }

  listSessions(): TwinChannelSession[] {
    return [...this.sessions.values()];
  }

  private touchSession(peer: string, twinId?: string) {
    const key = normalizeE164(peer);
    const existing = this.sessions.get(key);
    const next: TwinChannelSession = {
      id: existing?.id || `was_${createId()}`,
      channel: 'whatsapp',
      peer: key,
      twinId: twinId || existing?.twinId,
      lastMessageAt: new Date().toISOString(),
      status: existing?.status || 'active',
    };
    this.sessions.set(key, next);
  }
}

let sharedClient: WhatsAppCloudClient | null = null;

export function getWhatsAppCloudClient(): WhatsAppCloudClient {
  if (!sharedClient) {
    sharedClient = new WhatsAppCloudClient();
    sharedClient.fromEnv();
  }
  return sharedClient;
}
