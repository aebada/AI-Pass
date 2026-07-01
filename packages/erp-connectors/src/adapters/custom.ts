import { BaseERPAdapter, type PushResult } from '../ERPConnector.js';
import { resolveCredentials } from '../credentials.js';
import { DEFAULT_RATE_LIMIT, RateLimiter } from '../rate-limiter.js';
import type {
  CanonicalInvoice,
  CanonicalPayment,
  CanonicalVendor,
  ERPConnectionTestResult,
  ERPHealthCheckResult,
  ERPWebhookEvent,
} from '../types.js';

/**
 * Generic REST / webhook adapter for custom ERP or middleware integrations.
 * Supports configurable endpoints and field mapping via connection config.
 */
export class CustomERPAdapter extends BaseERPAdapter {
  readonly provider = 'custom' as const;
  private limiter = new RateLimiter(DEFAULT_RATE_LIMIT);

  async testConnection(): Promise<ERPConnectionTestResult> {
    const conn = this.requireConnection();
    const baseUrl = this.getConfigString('baseUrl');
    const healthPath = this.getConfigString('healthPath', '/health');
    const resolved = resolveCredentials(conn.credentials);

    if (!baseUrl) {
      return { ok: false, message: 'Custom adapter requires baseUrl in config' };
    }
    if (!resolved.apiKey && !resolved.clientSecret) {
      return { ok: false, message: 'Custom adapter requires apiKeyRef or clientSecretRef' };
    }

    await this.limiter.acquire();
    return {
      ok: true,
      message: `Custom ERP endpoint reachable (stub) — ${baseUrl}${healthPath}`,
      latencyMs: 80,
      details: { authType: conn.credentials.type },
    };
  }

  async healthCheck(): Promise<ERPHealthCheckResult> {
    const start = Date.now();
    const test = await this.testConnection();
    return {
      status: test.ok ? 'healthy' : 'unhealthy',
      latencyMs: Date.now() - start,
      message: test.message,
      checkedAt: new Date().toISOString(),
    };
  }

  private endpoint(resource: string): string {
    const conn = this.requireConnection();
    const baseUrl = this.getConfigString('baseUrl').replace(/\/$/, '');
    const paths = conn.config.paths as Record<string, string> | undefined;
    const path = paths?.[resource] ?? `/${resource}`;
    return `${baseUrl}${path}`;
  }

  async pushInvoice(invoice: CanonicalInvoice, idempotencyKey: string): Promise<PushResult> {
    await this.limiter.acquire();
    const payload = {
      idempotencyKey,
      invoice: {
        number: invoice.invoiceNumber,
        vendor: invoice.vendorName,
        amount: invoice.amount,
        currency: invoice.currency,
        items: invoice.items,
      },
    };
    return {
      externalId: `CUSTOM-INV-${invoice.id}-${idempotencyKey.slice(0, 8)}`,
      idempotencyKey,
      raw: { payload, endpoint: this.endpoint('invoices') },
    };
  }

  async pullInvoices(_since?: string): Promise<CanonicalInvoice[]> {
    await this.limiter.acquire();
    return [];
  }

  async pushVendor(vendor: CanonicalVendor, idempotencyKey: string): Promise<PushResult> {
    await this.limiter.acquire();
    return { externalId: `CUSTOM-VND-${vendor.id}`, idempotencyKey };
  }

  async pullVendors(_since?: string): Promise<CanonicalVendor[]> {
    return [];
  }

  async pushPayment(payment: CanonicalPayment, idempotencyKey: string): Promise<PushResult> {
    await this.limiter.acquire();
    return { externalId: `CUSTOM-PAY-${payment.id}`, idempotencyKey };
  }

  parseWebhook(body: Record<string, unknown>): ERPWebhookEvent | null {
    const eventType = String(body.eventType ?? body.type ?? 'unknown');
    const externalId = String(body.externalId ?? body.id ?? '');
    if (!externalId) return null;

    return {
      provider: 'custom',
      eventType,
      externalId,
      payload: body,
      receivedAt: new Date().toISOString(),
    };
  }
}
