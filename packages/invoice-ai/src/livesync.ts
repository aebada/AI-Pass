import { getLiveSyncEngine } from '@ai-pass/livesync';
import type { Invoice } from '@ai-pass/shared/invoice-ai';

export async function emitInvoiceUploaded(invoice: Invoice): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const result = await engine.runLive({
      event_type: 'invoice.uploaded',
      payload: {
        invoice_id: invoice.id,
        tenant_id: invoice.tenantId,
        vendor_id: invoice.vendorId,
        amount: invoice.amount,
        currency: invoice.currency,
        status: invoice.status,
      },
      source: 'invoice-ai',
    });
    return result.event_id;
  } catch {
    return undefined;
  }
}
