import { createId } from '@ai-pass/shared';
import type { ERPConnector } from './ERPConnector.js';
import { createERPAdapter } from './registry.js';
import type {
  CanonicalInvoice,
  CanonicalVendor,
  ERPConnection,
  ERPSyncRecord,
  ERPSyncResult,
} from './types.js';

export interface SyncEngineOptions {
  onAudit?: (entry: ERPAuditEntry) => void;
  idempotencyStore?: IdempotencyStore;
}

export interface ERPAuditEntry {
  tenantId: string;
  connectionId: string;
  provider: string;
  action: string;
  entityType?: string;
  entityId?: string;
  externalId?: string;
  status: 'success' | 'failed' | 'skipped';
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface IdempotencyStore {
  has(key: string): boolean;
  set(key: string, externalId: string): void;
  get(key: string): string | undefined;
}

export class InMemoryIdempotencyStore implements IdempotencyStore {
  private store = new Map<string, string>();

  has(key: string): boolean {
    return this.store.has(key);
  }

  set(key: string, externalId: string): void {
    this.store.set(key, externalId);
  }

  get(key: string): string | undefined {
    return this.store.get(key);
  }
}

export class ERPSyncEngine {
  private idempotency: IdempotencyStore;
  private onAudit?: (entry: ERPAuditEntry) => void;

  constructor(options: SyncEngineOptions = {}) {
    this.idempotency = options.idempotencyStore ?? new InMemoryIdempotencyStore();
    this.onAudit = options.onAudit;
  }

  private audit(entry: Omit<ERPAuditEntry, 'timestamp'>): void {
    this.onAudit?.({ ...entry, timestamp: new Date().toISOString() });
  }

  private buildIdempotencyKey(
    connection: ERPConnection,
    entityType: string,
    entityId: string,
    operation: string,
  ): string {
    return `${connection.tenantId}:${connection.id}:${entityType}:${entityId}:${operation}`;
  }

  async getConnector(connection: ERPConnection): Promise<ERPConnector> {
    const adapter = createERPAdapter(connection.provider);
    await adapter.connect(connection);
    return adapter;
  }

  async testConnection(connection: ERPConnection) {
    const connector = await this.getConnector(connection);
    try {
      return await connector.testConnection();
    } finally {
      await connector.disconnect();
    }
  }

  async healthCheck(connection: ERPConnection) {
    const connector = await this.getConnector(connection);
    try {
      return await connector.healthCheck();
    } finally {
      await connector.disconnect();
    }
  }

  async pushInvoice(
    connection: ERPConnection,
    invoice: CanonicalInvoice,
  ): Promise<ERPSyncRecord> {
    const idempotencyKey = this.buildIdempotencyKey(connection, 'invoice', invoice.id, 'push');
    const existing = this.idempotency.get(idempotencyKey);

    if (existing) {
      const record: ERPSyncRecord = {
        entityType: 'invoice',
        entityId: invoice.id,
        externalId: existing,
        direction: 'push',
        status: 'skipped',
        idempotencyKey,
      };
      this.audit({
        tenantId: connection.tenantId,
        connectionId: connection.id,
        provider: connection.provider,
        action: 'erp.invoice.push.skipped',
        entityType: 'invoice',
        entityId: invoice.id,
        externalId: existing,
        status: 'skipped',
      });
      return record;
    }

    const connector = await this.getConnector(connection);
    try {
      const result = await connector.pushInvoice(invoice, idempotencyKey);
      this.idempotency.set(idempotencyKey, result.externalId);

      const record: ERPSyncRecord = {
        entityType: 'invoice',
        entityId: invoice.id,
        externalId: result.externalId,
        direction: 'push',
        status: 'success',
        idempotencyKey,
      };

      this.audit({
        tenantId: connection.tenantId,
        connectionId: connection.id,
        provider: connection.provider,
        action: 'erp.invoice.push',
        entityType: 'invoice',
        entityId: invoice.id,
        externalId: result.externalId,
        status: 'success',
        details: { raw: result.raw },
      });

      return record;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.audit({
        tenantId: connection.tenantId,
        connectionId: connection.id,
        provider: connection.provider,
        action: 'erp.invoice.push.failed',
        entityType: 'invoice',
        entityId: invoice.id,
        status: 'failed',
        details: { error: message },
      });
      return {
        entityType: 'invoice',
        entityId: invoice.id,
        direction: 'push',
        status: 'failed',
        idempotencyKey,
        error: message,
      };
    } finally {
      await connector.disconnect();
    }
  }

  async pullInvoices(connection: ERPConnection, since?: string): Promise<ERPSyncRecord[]> {
    const connector = await this.getConnector(connection);
    try {
      const invoices = await connector.pullInvoices(since);
      const records: ERPSyncRecord[] = invoices.map((inv) => {
        const idempotencyKey = this.buildIdempotencyKey(
          connection,
          'invoice',
          inv.externalId ?? inv.id,
          'pull',
        );
        if (inv.externalId) this.idempotency.set(idempotencyKey, inv.externalId);
        return {
          entityType: 'invoice' as const,
          entityId: inv.id,
          externalId: inv.externalId,
          direction: 'pull' as const,
          status: 'success' as const,
          idempotencyKey,
        };
      });

      this.audit({
        tenantId: connection.tenantId,
        connectionId: connection.id,
        provider: connection.provider,
        action: 'erp.invoice.pull',
        status: 'success',
        details: { count: records.length, since },
      });

      return records;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.audit({
        tenantId: connection.tenantId,
        connectionId: connection.id,
        provider: connection.provider,
        action: 'erp.invoice.pull.failed',
        status: 'failed',
        details: { error: message },
      });
      throw err;
    } finally {
      await connector.disconnect();
    }
  }

  async pushVendor(
    connection: ERPConnection,
    vendor: CanonicalVendor,
  ): Promise<ERPSyncRecord> {
    const idempotencyKey = this.buildIdempotencyKey(connection, 'vendor', vendor.id, 'push');
    const connector = await this.getConnector(connection);
    try {
      const result = await connector.pushVendor(vendor, idempotencyKey);
      this.idempotency.set(idempotencyKey, result.externalId);
      return {
        entityType: 'vendor',
        entityId: vendor.id,
        externalId: result.externalId,
        direction: 'push',
        status: 'success',
        idempotencyKey,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return {
        entityType: 'vendor',
        entityId: vendor.id,
        direction: 'push',
        status: 'failed',
        idempotencyKey,
        error: message,
      };
    } finally {
      await connector.disconnect();
    }
  }

  async pullVendors(connection: ERPConnection, since?: string): Promise<ERPSyncRecord[]> {
    const connector = await this.getConnector(connection);
    try {
      const vendors = await connector.pullVendors(since);
      return vendors.map((v) => ({
        entityType: 'vendor' as const,
        entityId: v.id,
        externalId: v.externalId,
        direction: 'pull' as const,
        status: 'success' as const,
        idempotencyKey: this.buildIdempotencyKey(connection, 'vendor', v.id, 'pull'),
      }));
    } finally {
      await connector.disconnect();
    }
  }

  async sync(connection: ERPConnection, since?: string): Promise<ERPSyncResult> {
    const startedAt = new Date().toISOString();
    const records: ERPSyncRecord[] = [];
    const errors: string[] = [];

    if (connection.syncDirection === 'pull' || connection.syncDirection === 'bidirectional') {
      try {
        const pulled = await this.pullInvoices(connection, since);
        records.push(...pulled);
        const vendorRecords = await this.pullVendors(connection, since);
        records.push(...vendorRecords);
      } catch (err) {
        errors.push(err instanceof Error ? err.message : 'Pull sync failed');
      }
    }

    const pushed = records.filter((r) => r.direction === 'push' && r.status === 'success').length;
    const pulled = records.filter((r) => r.direction === 'pull' && r.status === 'success').length;
    const failed = records.filter((r) => r.status === 'failed').length;
    const skipped = records.filter((r) => r.status === 'skipped').length;

    const status =
      failed > 0 && pulled + pushed === 0
        ? 'failed'
        : failed > 0
          ? 'partial'
          : records.length === 0
            ? 'success'
            : 'success';

    return {
      connectionId: connection.id,
      tenantId: connection.tenantId,
      provider: connection.provider,
      status,
      startedAt,
      completedAt: new Date().toISOString(),
      records,
      pushed,
      pulled,
      failed,
      skipped,
      errors,
    };
  }
}

export function createIdempotencyKey(prefix = 'erp'): string {
  return `${prefix}_${createId()}`;
}

export const defaultERPSyncEngine = new ERPSyncEngine();
