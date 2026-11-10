import { createId } from '@ai-pass/shared';
import type { Invoice, Vendor } from '@ai-pass/shared/invoice-ai';
import {
  ERPSyncEngine,
  ERP_PROVIDER_LABELS,
  invoiceToCanonical,
  isERPProvider,
  listERPProviders,
  type ERPAuditEntry,
  type ERPConnection,
  type ERPProvider,
  type ERPSyncResult,
  type ERPWebhookEvent,
} from '@ai-pass/erp-connectors';
import { emitERPConnectionFailed, emitERPInvoiceSynced, emitERPPaymentPosted } from './erp-livesync.js';

export interface CreateERPConnectionInput {
  tenantId: string;
  provider: ERPProvider;
  name: string;
  credentials: ERPConnection['credentials'];
  config?: Record<string, unknown>;
  syncDirection?: ERPConnection['syncDirection'];
}

export interface ERPConnectionSummary extends ERPConnection {
  providerLabel: string;
  syncHistory: ERPSyncResult[];
}

export class ERPService {
  private connections = new Map<string, ERPConnection>();
  private syncHistory = new Map<string, ERPSyncResult[]>();
  private auditLogs: ERPAuditEntry[] = [];
  private syncEngine: ERPSyncEngine;

  constructor() {
    this.syncEngine = new ERPSyncEngine({
      onAudit: (entry) => this.recordAudit(entry),
    });
    this.seedDemoConnections();
  }

  private seedDemoConnections(): void {
    const demo: ERPConnection = {
      id: 'erp_demo_xero',
      tenantId: 'tenant_acme',
      provider: 'xero',
      name: 'Xero Production (Demo)',
      credentials: {
        type: 'oauth2',
        clientId: 'demo-client-id',
        clientSecretRef: 'env:XERO_CLIENT_SECRET',
        tenantId: 'demo-xero-tenant',
      },
      config: { xeroTenantId: 'demo-xero-tenant', sandbox: true },
      syncDirection: 'bidirectional',
      status: 'active',
      lastSyncAt: new Date(Date.now() - 3600_000).toISOString(),
      lastHealthCheckAt: new Date().toISOString(),
      createdAt: '2025-06-01T10:00:00Z',
      updatedAt: new Date().toISOString(),
    };
    this.connections.set(demo.id, demo);
  }

  listProviders(): Array<{ id: ERPProvider; label: string }> {
    return listERPProviders().map((id) => ({ id, label: ERP_PROVIDER_LABELS[id] }));
  }

  listConnections(tenantId: string): ERPConnectionSummary[] {
    return [...this.connections.values()]
      .filter((c) => c.tenantId === tenantId)
      .map((c) => ({
        ...c,
        providerLabel: ERP_PROVIDER_LABELS[c.provider],
        syncHistory: this.syncHistory.get(c.id) ?? [],
      }));
  }

  getConnection(id: string, tenantId: string): ERPConnection | undefined {
    const conn = this.connections.get(id);
    if (!conn || conn.tenantId !== tenantId) return undefined;
    return conn;
  }

  createConnection(input: CreateERPConnectionInput): ERPConnection {
    if (!isERPProvider(input.provider)) {
      throw new Error(`Invalid ERP provider: ${input.provider}`);
    }

    const now = new Date().toISOString();
    const connection: ERPConnection = {
      id: `erp_${createId()}`,
      tenantId: input.tenantId,
      provider: input.provider,
      name: input.name,
      credentials: input.credentials,
      config: input.config ?? {},
      syncDirection: input.syncDirection ?? 'bidirectional',
      status: 'pending_auth',
      createdAt: now,
      updatedAt: now,
    };

    this.connections.set(connection.id, connection);
    this.recordAudit({
      tenantId: input.tenantId,
      connectionId: connection.id,
      provider: connection.provider,
      action: 'erp.connection.created',
      status: 'success',
      details: { name: connection.name },
    });

    return connection;
  }

  async testConnection(id: string, tenantId: string) {
    const connection = this.getConnection(id, tenantId);
    if (!connection) throw new Error('ERP connection not found');

    const result = await this.syncEngine.testConnection(connection);
    connection.updatedAt = new Date().toISOString();
    connection.status = result.ok ? 'active' : 'error';
    connection.lastError = result.ok ? undefined : result.message;
    this.connections.set(connection.id, connection);

    if (!result.ok) {
      await emitERPConnectionFailed(connection, result.message);
    }

    this.recordAudit({
      tenantId,
      connectionId: id,
      provider: connection.provider,
      action: 'erp.connection.test',
      status: result.ok ? 'success' : 'failed',
      details: { message: result.message },
    });

    return result;
  }

  async healthCheck(id: string, tenantId: string) {
    const connection = this.getConnection(id, tenantId);
    if (!connection) throw new Error('ERP connection not found');

    const result = await this.syncEngine.healthCheck(connection);
    connection.lastHealthCheckAt = result.checkedAt;
    connection.status =
      result.status === 'healthy' ? 'active' : result.status === 'degraded' ? 'active' : 'error';
    connection.updatedAt = new Date().toISOString();
    this.connections.set(connection.id, connection);

    return result;
  }

  async syncConnection(id: string, tenantId: string, since?: string): Promise<ERPSyncResult> {
    const connection = this.getConnection(id, tenantId);
    if (!connection) throw new Error('ERP connection not found');

    const result = await this.syncEngine.sync(connection, since);
    connection.lastSyncAt = result.completedAt;
    connection.lastError = result.errors[0];
    connection.status = result.status === 'failed' ? 'error' : 'active';
    connection.updatedAt = new Date().toISOString();
    this.connections.set(connection.id, connection);

    const history = this.syncHistory.get(id) ?? [];
    history.unshift(result);
    this.syncHistory.set(id, history.slice(0, 20));

    this.recordAudit({
      tenantId,
      connectionId: id,
      provider: connection.provider,
      action: 'erp.connection.sync',
      status: result.status === 'failed' ? 'failed' : 'success',
      details: { pushed: result.pushed, pulled: result.pulled, failed: result.failed },
    });

    return result;
  }

  async pushApprovedInvoice(
    tenantId: string,
    invoice: Invoice,
    vendor?: Vendor,
  ): Promise<{ connectionId: string; externalId: string } | null> {
    const connections = this.listConnections(tenantId).filter(
      (c) => c.status === 'active' && c.syncDirection !== 'pull',
    );
    if (connections.length === 0) return null;

    const connection = connections[0]!;
    const canonical = invoiceToCanonical(invoice, vendor);
    const record = await this.syncEngine.pushInvoice(connection, canonical);

    if (record.status === 'success' && record.externalId) {
      await emitERPInvoiceSynced(connection, invoice.id, record.externalId);
      return { connectionId: connection.id, externalId: record.externalId };
    }

    if (record.status === 'failed') {
      await emitERPConnectionFailed(connection, record.error ?? 'Invoice push failed');
    }

    return null;
  }

  async pushPayment(
    tenantId: string,
    params: {
      invoiceId: string;
      invoiceExternalId?: string;
      amount: number;
      currency: string;
      paymentDate: string;
    },
  ): Promise<{ externalId: string } | null> {
    const connections = this.listConnections(tenantId).filter((c) => c.status === 'active');
    if (connections.length === 0) return null;

    const connection = connections[0]!;
    const connector = await this.syncEngine.getConnector(connection);
    try {
      const result = await connector.pushPayment(
        {
          id: `pay_${createId()}`,
          tenantId,
          invoiceId: params.invoiceId,
          invoiceExternalId: params.invoiceExternalId,
          amount: params.amount,
          currency: params.currency,
          paymentDate: params.paymentDate,
        },
        `pay:${params.invoiceId}:${params.paymentDate}`,
      );

      await emitERPPaymentPosted(connection, params.invoiceId, result.externalId);
      return { externalId: result.externalId };
    } finally {
      await connector.disconnect();
    }
  }

  handleWebhook(provider: string, body: Record<string, unknown>): ERPWebhookEvent | null {
    if (!isERPProvider(provider)) return null;

    const event: ERPWebhookEvent = {
      provider,
      eventType: String(body.eventType ?? body.type ?? 'webhook'),
      externalId: String(body.externalId ?? body.id ?? createId()),
      payload: body,
      receivedAt: new Date().toISOString(),
    };

    this.recordAudit({
      tenantId: String(body.tenantId ?? 'unknown'),
      connectionId: String(body.connectionId ?? 'webhook'),
      provider,
      action: 'erp.webhook.received',
      status: 'success',
      details: { eventType: event.eventType, externalId: event.externalId },
    });

    return event;
  }

  getAuditLogs(tenantId: string, connectionId?: string): ERPAuditEntry[] {
    return this.auditLogs.filter(
      (l) =>
        l.tenantId === tenantId && (!connectionId || l.connectionId === connectionId),
    );
  }

  private recordAudit(entry: Omit<ERPAuditEntry, 'timestamp'>): void {
    this.auditLogs.unshift({ ...entry, timestamp: new Date().toISOString() });
    if (this.auditLogs.length > 500) this.auditLogs.pop();
  }
}

export const defaultERPService = new ERPService();
