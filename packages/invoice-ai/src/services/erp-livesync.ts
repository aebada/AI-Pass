import { getLiveSyncEngine } from '@ai-pass/livesync';
import type { ERPConnection } from '@ai-pass/erp-connectors';

export async function emitERPInvoiceSynced(
  connection: ERPConnection,
  invoiceId: string,
  externalId: string,
): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const result = await engine.runLive({
      event_type: 'erp.invoice.synced',
      payload: {
        connection_id: connection.id,
        tenant_id: connection.tenantId,
        provider: connection.provider,
        invoice_id: invoiceId,
        external_id: externalId,
      },
      source: 'invoice-ai',
    });
    return result.event_id;
  } catch {
    return undefined;
  }
}

export async function emitERPPaymentPosted(
  connection: ERPConnection,
  invoiceId: string,
  externalId: string,
): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const result = await engine.runLive({
      event_type: 'erp.payment.posted',
      payload: {
        connection_id: connection.id,
        tenant_id: connection.tenantId,
        provider: connection.provider,
        invoice_id: invoiceId,
        payment_external_id: externalId,
      },
      source: 'invoice-ai',
    });
    return result.event_id;
  } catch {
    return undefined;
  }
}

export async function emitERPConnectionFailed(
  connection: ERPConnection,
  error: string,
): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const result = await engine.runLive({
      event_type: 'erp.connection.failed',
      payload: {
        connection_id: connection.id,
        tenant_id: connection.tenantId,
        provider: connection.provider,
        error,
      },
      source: 'invoice-ai',
    });
    return result.event_id;
  } catch {
    return undefined;
  }
}

export async function emitERPSyncCompleted(
  connection: ERPConnection,
  pulled: number,
  pushed: number,
): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const result = await engine.runLive({
      event_type: 'erp.sync',
      payload: {
        connection_id: connection.id,
        tenant_id: connection.tenantId,
        provider: connection.provider,
        pulled,
        pushed,
      },
      source: 'invoice-ai',
    });
    return result.event_id;
  } catch {
    return undefined;
  }
}
