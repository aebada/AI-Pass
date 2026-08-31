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
 * Microsoft Dynamics 365 Finance & Operations adapter.
 * Stub: OData v4 patterns for VendInvoiceJournal / VendVendorV2 entities.
 */
export class DynamicsAdapter extends BaseERPAdapter {
  readonly provider = 'dynamics' as const;
  private limiter = new RateLimiter(DEFAULT_RATE_LIMIT);

  async testConnection(): Promise<ERPConnectionTestResult> {
    const conn = this.requireConnection();
    const baseUrl = this.getConfigString(
      'baseUrl',
      'https://your-org.operations.dynamics.com',
    );
    const resolved = resolveCredentials(conn.credentials);

    if (!conn.credentials.clientId || !resolved.clientSecret) {
      return { ok: false, message: 'Dynamics 365 requires Azure AD clientId + clientSecretRef' };
    }

    await this.limiter.acquire();
    return {
      ok: true,
      message: `Dynamics 365 OData reachable (stub) — ${baseUrl}/data/VendInvoiceJournalHeaders`,
      latencyMs: 150,
      details: {
        tenantId: conn.credentials.tenantId,
        company: conn.config.company,
        environment: conn.config.environment,
      },
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
    const conn = this.requireConnection();
    await this.limiter.acquire();

    const payload = {
      dataAreaId: conn.config.company,
      InvoiceNumber: invoice.invoiceNumber,
      InvoiceDate: invoice.issueDate,
      DueDate: invoice.dueDate,
      InvoiceAmount: invoice.amount,
      CurrencyCode: invoice.currency,
      VendorAccountNumber: invoice.vendorId,
      IdempotencyKey: idempotencyKey,
      lines: invoice.items.map((item, idx) => ({
        LineNumber: idx + 1,
        MainAccount: item.glAccount,
        DebitAmount: item.total,
        Description: item.description,
      })),
    };

    return {
      externalId: `D365-INV-${invoice.invoiceNumber}`,
      idempotencyKey,
      raw: { payload },
    };
  }

  async pullInvoices(_since?: string): Promise<CanonicalInvoice[]> {
    return [];
  }

  async pushVendor(vendor: CanonicalVendor, idempotencyKey: string): Promise<PushResult> {
    await this.limiter.acquire();
    return { externalId: `D365-VND-${vendor.id}`, idempotencyKey };
  }

  async pullVendors(_since?: string): Promise<CanonicalVendor[]> {
    return [];
  }

  async pushPayment(payment: CanonicalPayment, idempotencyKey: string): Promise<PushResult> {
    await this.limiter.acquire();
    return { externalId: `D365-PAY-${payment.id}`, idempotencyKey };
  }
}
