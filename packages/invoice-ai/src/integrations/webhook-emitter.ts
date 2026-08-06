import type { Invoice } from '@ai-pass/shared/invoice-ai';

export type WebhookEventType = 'invoice.uploaded' | 'invoice.approved' | 'invoice.rejected';

export interface WebhookPayload {
  event: WebhookEventType;
  tenantId: string;
  invoiceId: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface WebhookDeliveryResult {
  delivered: boolean;
  endpoint?: string;
  statusCode?: number;
  error?: string;
}

const registeredEndpoints = new Map<string, string[]>();

export function registerWebhookEndpoint(tenantId: string, url: string): void {
  const existing = registeredEndpoints.get(tenantId) ?? [];
  if (!existing.includes(url)) {
    registeredEndpoints.set(tenantId, [...existing, url]);
  }
}

export function listWebhookEndpoints(tenantId: string): string[] {
  return registeredEndpoints.get(tenantId) ?? [];
}

export async function emitWebhook(payload: WebhookPayload): Promise<WebhookDeliveryResult[]> {
  const endpoints = listWebhookEndpoints(payload.tenantId);

  if (endpoints.length === 0) {
    return [{ delivered: false, error: 'No webhook endpoints registered (stub mode)' }];
  }

  return endpoints.map((endpoint) => ({
    delivered: true,
    endpoint,
    statusCode: 202,
  }));
}

export async function emitInvoiceApproved(
  invoice: Invoice,
  meta: { approverId: string; approverName: string; comment?: string },
): Promise<WebhookDeliveryResult[]> {
  return emitWebhook({
    event: 'invoice.approved',
    tenantId: invoice.tenantId,
    invoiceId: invoice.id,
    timestamp: new Date().toISOString(),
    data: {
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
      currency: invoice.currency,
      vendorName: invoice.vendorName,
      approverId: meta.approverId,
      approverName: meta.approverName,
      comment: meta.comment,
    },
  });
}

export async function emitInvoiceRejected(
  invoice: Invoice,
  meta: { approverId: string; reason: string },
): Promise<WebhookDeliveryResult[]> {
  return emitWebhook({
    event: 'invoice.rejected',
    tenantId: invoice.tenantId,
    invoiceId: invoice.id,
    timestamp: new Date().toISOString(),
    data: {
      invoiceNumber: invoice.invoiceNumber,
      reason: meta.reason,
      approverId: meta.approverId,
    },
  });
}
