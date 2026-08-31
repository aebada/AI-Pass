import { BaseERPAdapter, type PushResult } from '../ERPConnector.js';
import { resolveCredentials } from '../credentials.js';
import { DEFAULT_RATE_LIMIT, RateLimiter, withRetry } from '../rate-limiter.js';
import type {
  CanonicalInvoice,
  CanonicalPayment,
  CanonicalVendor,
  ERPConnectionTestResult,
  ERPHealthCheckResult,
} from '../types.js';

/**
 * Oracle Fusion Cloud ERP REST adapter.
 * Stub: structured for Payables REST / FBDI patterns.
 */
export class OracleCloudAdapter extends BaseERPAdapter {
  readonly provider = 'oracle-cloud' as const;
  private limiter = new RateLimiter({ ...DEFAULT_RATE_LIMIT, maxRequests: 30 });

  async testConnection(): Promise<ERPConnectionTestResult> {
    const conn = this.requireConnection();
    const baseUrl = this.getConfigString('baseUrl', 'https://fa-eu-test-saasfaprod1.fa.ocs.oraclecloud.com');
    const resolved = resolveCredentials(conn.credentials);

    if (!conn.credentials.clientId || !resolved.clientSecret) {
      return { ok: false, message: 'Oracle Cloud requires OAuth2 clientId + clientSecretRef' };
    }

    return withRetry(async () => {
      await this.limiter.acquire();
      return {
        ok: true,
        message: `Oracle Fusion REST reachable (stub) — ${baseUrl}/fscmRestApi/resources/11.13.18.05/invoices`,
        latencyMs: 180,
        details: { pod: conn.config.pod, ledgerId: conn.config.ledgerId },
      };
    });
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
      InvoiceNumber: invoice.invoiceNumber,
      InvoiceAmount: invoice.amount,
      InvoiceCurrencyCode: invoice.currency,
      Supplier: invoice.vendorName,
      SupplierTaxRegistrationNumber: invoice.vendorTaxId,
      InvoiceDate: invoice.issueDate,
      TermsDate: invoice.dueDate,
      invoiceLines: invoice.items.map((item, idx) => ({
        LineNumber: idx + 1,
        LineAmount: item.total,
        Description: item.description,
        DistributionCombination: item.glAccount,
      })),
      IdempotencyKey: idempotencyKey,
    };

    const externalId = `ORA-INV-${invoice.invoiceNumber}`;
    return { externalId, idempotencyKey, raw: { payload } };
  }

  async pullInvoices(_since?: string): Promise<CanonicalInvoice[]> {
    await this.limiter.acquire();
    return [];
  }

  async pushVendor(vendor: CanonicalVendor, idempotencyKey: string): Promise<PushResult> {
    await this.limiter.acquire();
    return { externalId: `ORA-SUP-${vendor.id}`, idempotencyKey };
  }

  async pullVendors(_since?: string): Promise<CanonicalVendor[]> {
    return [];
  }

  async pushPayment(payment: CanonicalPayment, idempotencyKey: string): Promise<PushResult> {
    await this.limiter.acquire();
    return { externalId: `ORA-PAY-${payment.id}`, idempotencyKey };
  }
}
