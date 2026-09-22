import { BaseERPAdapter, type PushResult } from '../ERPConnector.js';
import { resolveCredentials } from '../credentials.js';
import { DEFAULT_RATE_LIMIT, RateLimiter } from '../rate-limiter.js';
import type {
  CanonicalInvoice,
  CanonicalPayment,
  CanonicalVendor,
  ERPConnectionTestResult,
  ERPHealthCheckResult,
} from '../types.js';

/**
 * DATEV API adapter (German accounting / Belegtransfer).
 * Partial implementation: maps to DATEV Belegdatenservice / Rechnungsdatenservice patterns.
 */
export class DATEVAdapter extends BaseERPAdapter {
  readonly provider = 'datev' as const;
  private limiter = new RateLimiter({ ...DEFAULT_RATE_LIMIT, maxRequests: 20 });

  async testConnection(): Promise<ERPConnectionTestResult> {
    const conn = this.requireConnection();
    const baseUrl = this.getConfigString('baseUrl', 'https://accounting-dx.api.datev.de/platform/v1');
    const resolved = resolveCredentials(conn.credentials);
    const consultantNumber = conn.config.consultantNumber;
    const clientNumber = conn.config.clientNumber;

    if (!resolved.apiKey && !resolved.clientSecret) {
      return { ok: false, message: 'DATEV requires apiKeyRef or OAuth2 clientSecretRef' };
    }
    if (!consultantNumber || !clientNumber) {
      return { ok: false, message: 'DATEV requires consultantNumber and clientNumber in config' };
    }

    await this.limiter.acquire();
    return {
      ok: true,
      message: `DATEV platform API reachable (stub) — Berater ${consultantNumber} / Mandant ${clientNumber}`,
      latencyMs: 95,
      details: { baseUrl, fiscalYear: conn.config.fiscalYear },
    };
  }

  async healthCheck(): Promise<ERPHealthCheckResult> {
    const start = Date.now();
    const test = await this.testConnection();
    return {
      status: test.ok ? 'healthy' : 'degraded',
      latencyMs: Date.now() - start,
      message: test.message,
      checkedAt: new Date().toISOString(),
    };
  }

  async pushInvoice(invoice: CanonicalInvoice, idempotencyKey: string): Promise<PushResult> {
    const conn = this.requireConnection();
    await this.limiter.acquire();

    const payload = {
      header: {
        date: invoice.issueDate?.slice(0, 10),
        delivery_date: invoice.issueDate?.slice(0, 10),
        invoice_type: 'invoice',
        invoice_id: invoice.invoiceNumber,
        currency_code: invoice.currency === 'EUR' ? 'EUR' : invoice.currency,
        gross_amount: invoice.amount,
        net_amount: invoice.taxAmount ? invoice.amount - invoice.taxAmount : invoice.amount,
        tax_amount: invoice.taxAmount ?? 0,
      },
      parties: {
        vendor_name: invoice.vendorName,
        vendor_tax_id: invoice.vendorTaxId,
      },
      line_items: invoice.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        net_value: item.total,
        tax_rate: item.taxRate ?? 19,
        account_number: item.glAccount ?? conn.config.defaultGlAccount,
      })),
      _idempotencyKey: idempotencyKey,
    };

    const externalId = `DATEV-${invoice.invoiceNumber}-${idempotencyKey.slice(0, 8)}`;
    return { externalId, idempotencyKey, raw: { payload } };
  }

  async pullInvoices(_since?: string): Promise<CanonicalInvoice[]> {
    return [];
  }

  async pushVendor(vendor: CanonicalVendor, idempotencyKey: string): Promise<PushResult> {
    await this.limiter.acquire();
    return { externalId: `DATEV-KRED-${vendor.taxId ?? vendor.id}`, idempotencyKey };
  }

  async pullVendors(_since?: string): Promise<CanonicalVendor[]> {
    return [];
  }

  async pushPayment(payment: CanonicalPayment, idempotencyKey: string): Promise<PushResult> {
    await this.limiter.acquire();
    return { externalId: `DATEV-ZA-${payment.id}`, idempotencyKey };
  }
}
