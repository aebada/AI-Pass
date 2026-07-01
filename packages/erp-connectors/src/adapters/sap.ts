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
 * SAP S/4HANA / Business One REST/OData adapter.
 * Stub: structured for OData v4 AP invoice posting; requires live SAP endpoint for production.
 */
export class SAPAdapter extends BaseERPAdapter {
  readonly provider = 'sap' as const;
  private limiter = new RateLimiter(DEFAULT_RATE_LIMIT);

  async testConnection(): Promise<ERPConnectionTestResult> {
    const conn = this.requireConnection();
    const baseUrl = this.getConfigString('baseUrl', 'https://my-sap-system.example.com');
    const resolved = resolveCredentials(conn.credentials);

    if (!resolved.clientSecret && !resolved.apiKey) {
      return {
        ok: false,
        message: 'Missing SAP credentials — set clientSecretRef or apiKeyRef env reference',
      };
    }

    return withRetry(async () => {
      await this.limiter.acquire();
      return {
        ok: true,
        message: `SAP OData endpoint reachable (stub) — ${baseUrl}/sap/opu/odata/sap/API_SUPPLIERINVOICE_PROCESS_SRV`,
        latencyMs: 120,
        details: { systemId: conn.config.systemId, client: conn.config.client },
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
      details: test.details,
    };
  }

  async pushInvoice(invoice: CanonicalInvoice, idempotencyKey: string): Promise<PushResult> {
    const conn = this.requireConnection();
    await this.limiter.acquire();

    const payload = {
      SupplierInvoice: invoice.invoiceNumber,
      DocumentDate: invoice.issueDate,
      DueCalculationBaseDate: invoice.dueDate,
      InvoiceGrossAmount: invoice.amount.toFixed(2),
      DocumentCurrency: invoice.currency,
      Supplier: invoice.vendorTaxId ?? invoice.vendorId,
      to_SupplierInvoiceItemPurOrdRef: invoice.items.map((item, idx) => ({
        SupplierInvoiceItem: String((idx + 1) * 10),
        PurchaseOrder: item.costCenter ?? '',
        PurchaseOrderItem: String(idx + 1),
        SupplierInvoiceItemAmount: item.total.toFixed(2),
        QuantityInPurchaseOrderUnit: String(item.quantity),
      })),
      _idempotencyKey: idempotencyKey,
    };

    const externalId = `SAP-INV-${invoice.invoiceNumber}-${idempotencyKey.slice(0, 8)}`;
    return { externalId, idempotencyKey, raw: { payload, companyCode: conn.config.companyCode } };
  }

  async pullInvoices(_since?: string): Promise<CanonicalInvoice[]> {
    await this.limiter.acquire();
    return [];
  }

  async pushVendor(vendor: CanonicalVendor, idempotencyKey: string): Promise<PushResult> {
    await this.limiter.acquire();
    const externalId = `SAP-VND-${vendor.taxId ?? vendor.id}-${idempotencyKey.slice(0, 8)}`;
    return { externalId, idempotencyKey };
  }

  async pullVendors(_since?: string): Promise<CanonicalVendor[]> {
    await this.limiter.acquire();
    return [];
  }

  async pushPayment(payment: CanonicalPayment, idempotencyKey: string): Promise<PushResult> {
    await this.limiter.acquire();
    const externalId = `SAP-PAY-${payment.id}-${idempotencyKey.slice(0, 8)}`;
    return { externalId, idempotencyKey };
  }
}
