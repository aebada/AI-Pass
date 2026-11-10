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

const XERO_API_BASE = 'https://api.xero.com/api.xro/2.0';

/**
 * Xero Accounting API adapter.
 * Structured for OAuth2 + ACCPAY invoices, contacts, payments.
 */
export class XeroAdapter extends BaseERPAdapter {
  readonly provider = 'xero' as const;
  private limiter = new RateLimiter({ ...DEFAULT_RATE_LIMIT, maxRequests: 60, windowMs: 60_000 });

  async testConnection(): Promise<ERPConnectionTestResult> {
    const conn = this.requireConnection();
    const resolved = resolveCredentials(conn.credentials);
    const tenantId = conn.credentials.tenantId ?? String(conn.config.xeroTenantId ?? '');

    if (!conn.credentials.clientId || !resolved.clientSecret) {
      return { ok: false, message: 'Xero requires OAuth2 clientId + clientSecretRef' };
    }
    if (!tenantId) {
      return { ok: false, message: 'Xero requires tenantId in credentials or xeroTenantId in config' };
    }

    await this.limiter.acquire();
    return {
      ok: true,
      message: `Xero Accounting API reachable (stub) — ${XERO_API_BASE}/Invoices`,
      latencyMs: 130,
      details: { xeroTenantId: tenantId },
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

  async pushInvoice(invoice: CanonicalInvoice, idempotencyKey: string): Promise<PushResult> {
    await this.limiter.acquire();

    const payload = {
      Type: 'ACCPAY',
      Contact: { ContactID: invoice.vendorId, Name: invoice.vendorName },
      Date: invoice.issueDate?.slice(0, 10),
      DueDate: invoice.dueDate?.slice(0, 10),
      InvoiceNumber: invoice.invoiceNumber,
      CurrencyCode: invoice.currency,
      LineAmountTypes: 'Exclusive',
      LineItems: invoice.items.map((item) => ({
        Description: item.description,
        Quantity: item.quantity,
        UnitAmount: item.unitPrice,
        LineAmount: item.total,
        TaxType: item.taxRate ? 'OUTPUT' : 'NONE',
        AccountCode: item.glAccount ?? '400',
      })),
      Reference: idempotencyKey,
    };

    return {
      externalId: `XERO-INV-${invoice.invoiceNumber}`,
      idempotencyKey,
      raw: { payload, endpoint: `${XERO_API_BASE}/Invoices` },
    };
  }

  async pullInvoices(since?: string): Promise<CanonicalInvoice[]> {
    await this.limiter.acquire();
    void since;
    return [];
  }

  async pushVendor(vendor: CanonicalVendor, idempotencyKey: string): Promise<PushResult> {
    await this.limiter.acquire();
    const payload = {
      Name: vendor.name,
      EmailAddress: vendor.email,
      TaxNumber: vendor.taxId,
      IsSupplier: true,
    };
    return { externalId: `XERO-CNT-${vendor.id}`, idempotencyKey, raw: { payload } };
  }

  async pullVendors(_since?: string): Promise<CanonicalVendor[]> {
    return [];
  }

  async pushPayment(payment: CanonicalPayment, idempotencyKey: string): Promise<PushResult> {
    await this.limiter.acquire();
    const payload = {
      Invoice: { InvoiceID: payment.invoiceExternalId },
      Account: { Code: '090' },
      Date: payment.paymentDate.slice(0, 10),
      Amount: payment.amount,
      Reference: payment.reference ?? idempotencyKey,
    };
    return { externalId: `XERO-PAY-${payment.id}`, idempotencyKey, raw: { payload } };
  }
}
