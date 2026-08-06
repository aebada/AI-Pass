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

const QBO_API_BASE = 'https://quickbooks.api.intuit.com/v3/company';

/**
 * QuickBooks Online API adapter.
 * Structured for OAuth2 + Bill/Vendor/Payment entities; live calls require Intuit credentials.
 */
export class QuickBooksAdapter extends BaseERPAdapter {
  readonly provider = 'quickbooks' as const;
  private limiter = new RateLimiter({ ...DEFAULT_RATE_LIMIT, maxRequests: 500, windowMs: 60_000 });

  private getRealmId(): string {
    const conn = this.requireConnection();
    return conn.credentials.realmId ?? String(conn.config.realmId ?? '');
  }

  async testConnection(): Promise<ERPConnectionTestResult> {
    const conn = this.requireConnection();
    const resolved = resolveCredentials(conn.credentials);
    const realmId = this.getRealmId();

    if (!conn.credentials.clientId || !resolved.clientSecret) {
      return { ok: false, message: 'QuickBooks requires OAuth2 clientId + clientSecretRef' };
    }
    if (!realmId) {
      return { ok: false, message: 'QuickBooks requires realmId in credentials or config' };
    }

    await this.limiter.acquire();
    return {
      ok: true,
      message: `QuickBooks Online API reachable (stub) — ${QBO_API_BASE}/${realmId}/bill`,
      latencyMs: 110,
      details: { realmId, sandbox: conn.config.sandbox === true },
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
    const realmId = this.getRealmId();
    await this.limiter.acquire();

    const payload = {
      DocNumber: invoice.invoiceNumber,
      TxnDate: invoice.issueDate?.slice(0, 10),
      DueDate: invoice.dueDate?.slice(0, 10),
      TotalAmt: invoice.amount,
      CurrencyRef: { value: invoice.currency },
      VendorRef: { value: invoice.vendorId, name: invoice.vendorName },
      Line: invoice.items.map((item) => ({
        Amount: item.total,
        DetailType: 'AccountBasedExpenseLineDetail',
        Description: item.description,
        AccountBasedExpenseLineDetail: {
          AccountRef: { value: item.glAccount ?? '65' },
        },
      })),
      PrivateNote: `idempotency:${idempotencyKey}`,
    };

    return {
      externalId: `QBO-BILL-${realmId}-${invoice.invoiceNumber}`,
      idempotencyKey,
      raw: { payload, endpoint: `${QBO_API_BASE}/${realmId}/bill` },
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
      DisplayName: vendor.name,
      PrimaryEmailAddr: vendor.email ? { Address: vendor.email } : undefined,
      TaxIdentifier: vendor.taxId,
      CompanyName: vendor.name,
    };
    return {
      externalId: `QBO-VND-${vendor.id}`,
      idempotencyKey,
      raw: { payload },
    };
  }

  async pullVendors(_since?: string): Promise<CanonicalVendor[]> {
    return [];
  }

  async pushPayment(payment: CanonicalPayment, idempotencyKey: string): Promise<PushResult> {
    await this.limiter.acquire();
    const payload = {
      TotalAmt: payment.amount,
      TxnDate: payment.paymentDate.slice(0, 10),
      PayType: 'Check',
      Line: [{ Amount: payment.amount, LinkedTxn: [{ TxnId: payment.invoiceExternalId, TxnType: 'Bill' }] }],
    };
    return { externalId: `QBO-PAY-${payment.id}`, idempotencyKey, raw: { payload } };
  }
}
