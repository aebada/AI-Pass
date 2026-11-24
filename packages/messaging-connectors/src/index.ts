export type {
  MessagingChannel,
  SendResult,
  TwinChannelSession,
  WebhookVerifyResult,
  WhatsAppConfig,
  WhatsAppInboundMessage,
  WhatsAppTextMessage,
} from './types.js';

export { WhatsAppCloudClient, getWhatsAppCloudClient } from './whatsapp-cloud.js';

/** Instinct-style channels: reach the twin without a new app UI. */
export const TWIN_CHAT_CHANNELS = [
  {
    id: 'whatsapp' as const,
    name: 'WhatsApp',
    summary:
      'Text or voice-note your personal or employee twin on WhatsApp Business Cloud API — no new interface.',
    status: 'available' as const,
    provider: 'Meta Cloud API',
  },
  {
    id: 'sms' as const,
    name: 'SMS',
    summary: 'Reach the twin by SMS (Twilio or carrier) for quick approvals and follow-ups.',
    status: 'beta' as const,
    provider: 'Twilio / BYO',
  },
  {
    id: 'imessage' as const,
    name: 'iMessage bridge',
    summary: 'Optional Mac bridge for iMessage (bring your own device runtime).',
    status: 'bring_your_own' as const,
    provider: 'Device runtime',
  },
];
