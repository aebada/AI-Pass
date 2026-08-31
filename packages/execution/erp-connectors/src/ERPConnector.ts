import type {
  CanonicalInvoice,
  CanonicalPayment,
  CanonicalVendor,
  ERPConnection,
  ERPConnectionTestResult,
  ERPHealthCheckResult,
  ERPProvider,
} from './types.js';

export interface PushResult {
  externalId: string;
  idempotencyKey: string;
  raw?: Record<string, unknown>;
}

export interface ERPConnector {
  readonly provider: ERPProvider;

  connect(connection: ERPConnection): Promise<void>;
  disconnect(): Promise<void>;
  testConnection(): Promise<ERPConnectionTestResult>;
  healthCheck(): Promise<ERPHealthCheckResult>;

  pushInvoice(invoice: CanonicalInvoice, idempotencyKey: string): Promise<PushResult>;
  pullInvoices(since?: string): Promise<CanonicalInvoice[]>;

  pushVendor(vendor: CanonicalVendor, idempotencyKey: string): Promise<PushResult>;
  pullVendors(since?: string): Promise<CanonicalVendor[]>;

  pushPayment(payment: CanonicalPayment, idempotencyKey: string): Promise<PushResult>;
}

export abstract class BaseERPAdapter implements ERPConnector {
  abstract readonly provider: ERPProvider;
  protected connection: ERPConnection | null = null;

  async connect(connection: ERPConnection): Promise<void> {
    this.connection = connection;
  }

  async disconnect(): Promise<void> {
    this.connection = null;
  }

  protected requireConnection(): ERPConnection {
    if (!this.connection) {
      throw new Error(`ERP adapter not connected (${this.provider})`);
    }
    return this.connection;
  }

  protected getConfigString(key: string, fallback = ''): string {
    const conn = this.requireConnection();
    const value = conn.config[key];
    return typeof value === 'string' ? value : fallback;
  }

  abstract testConnection(): Promise<ERPConnectionTestResult>;
  abstract healthCheck(): Promise<ERPHealthCheckResult>;
  abstract pushInvoice(invoice: CanonicalInvoice, idempotencyKey: string): Promise<PushResult>;
  abstract pullInvoices(since?: string): Promise<CanonicalInvoice[]>;
  abstract pushVendor(vendor: CanonicalVendor, idempotencyKey: string): Promise<PushResult>;
  abstract pullVendors(since?: string): Promise<CanonicalVendor[]>;
  abstract pushPayment(payment: CanonicalPayment, idempotencyKey: string): Promise<PushResult>;
}
