import type { Invoice } from '@ai-pass/shared/invoice-ai';

export type NotificationChannel = 'email' | 'teams' | 'slack';

export interface NotificationRequest {
  channel: NotificationChannel;
  tenantId: string;
  subject: string;
  body: string;
  recipients?: string[];
  metadata?: Record<string, unknown>;
}

export interface NotificationResult {
  channel: NotificationChannel;
  status: 'stub_sent' | 'skipped';
  messageId: string;
  sentAt: string;
}

export async function sendEmailNotification(
  request: Omit<NotificationRequest, 'channel'>,
): Promise<NotificationResult> {
  return stubSend({ ...request, channel: 'email' });
}

export async function sendTeamsNotification(
  request: Omit<NotificationRequest, 'channel'>,
): Promise<NotificationResult> {
  return stubSend({ ...request, channel: 'teams' });
}

export async function sendSlackNotification(
  request: Omit<NotificationRequest, 'channel'>,
): Promise<NotificationResult> {
  return stubSend({ ...request, channel: 'slack' });
}

export async function notifyInvoiceApproved(
  invoice: Invoice,
  channels: NotificationChannel[] = ['email'],
): Promise<NotificationResult[]> {
  const subject = `Invoice ${invoice.invoiceNumber} approved`;
  const body = `${invoice.vendorName} — EUR ${invoice.amount.toLocaleString()} approved for payment.`;

  return Promise.all(
    channels.map((channel) => {
      const req = { tenantId: invoice.tenantId, subject, body, metadata: { invoiceId: invoice.id } };
      switch (channel) {
        case 'email': return sendEmailNotification(req);
        case 'teams': return sendTeamsNotification(req);
        case 'slack': return sendSlackNotification(req);
      }
    }),
  );
}

function stubSend(request: NotificationRequest): NotificationResult {
  return {
    channel: request.channel,
    status: 'stub_sent',
    messageId: `msg_${request.channel}_${Date.now()}`,
    sentAt: new Date().toISOString(),
  };
}
