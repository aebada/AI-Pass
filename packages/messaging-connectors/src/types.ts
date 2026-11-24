export type MessagingChannel = 'whatsapp' | 'sms' | 'imessage' | 'email';

export type WhatsAppConfig = {
  accessToken: string;
  phoneNumberId: string;
  verifyToken: string;
  businessAccountId?: string;
  appSecret?: string;
  graphVersion?: string;
  /** Public HTTPS URL Meta calls for inbound messages */
  webhookPath?: string;
};

export type WhatsAppTextMessage = {
  to: string;
  body: string;
  /** Optional Meta message id to reply in-thread */
  replyToMessageId?: string;
};

export type WhatsAppInboundMessage = {
  id: string;
  from: string;
  timestamp: string;
  type: string;
  text?: string;
  raw: unknown;
};

export type SendResult = {
  success: boolean;
  channel: MessagingChannel;
  externalId?: string;
  stubbed: boolean;
  message?: string;
  error?: string;
};

export type WebhookVerifyResult =
  | { ok: true; challenge: string }
  | { ok: false; reason: string };

export type TwinChannelSession = {
  id: string;
  channel: MessagingChannel;
  peer: string;
  twinId?: string;
  lastMessageAt?: string;
  status: 'active' | 'paused' | 'needs_approval';
};
