import { getWhatsAppCloudClient, TWIN_CHAT_CHANNELS } from '@ai-pass/messaging-connectors';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const client = getWhatsAppCloudClient();
  return NextResponse.json({
    status: client.getStatus(),
    channels: TWIN_CHAT_CHANNELS,
    sessions: client.listSessions(),
    inbox: client.listInbox(20),
    setup: {
      env: [
        'WHATSAPP_ACCESS_TOKEN',
        'WHATSAPP_PHONE_NUMBER_ID',
        'WHATSAPP_VERIFY_TOKEN',
        'WHATSAPP_BUSINESS_ACCOUNT_ID',
        'WHATSAPP_APP_SECRET',
      ],
      webhookPath: '/api/v1/messaging/whatsapp/webhook',
      docs: 'https://developers.facebook.com/docs/whatsapp/cloud-api',
    },
  });
}
