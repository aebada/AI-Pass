import type { ErpConnectionConfig, ErpPurchaseOrder, ErpSourcingEvent, ErpSyncResult } from '../types.js';

/** Coupa procurement adapter stub — no live API calls */
export class CoupaAdapter {
  constructor(_config: ErpConnectionConfig) {}

  async listSourcingEvents(): Promise<ErpSourcingEvent[]> {
    return [
      {
        externalId: 'coupa_evt_001',
        title: 'IT Hardware Refresh Q3',
        status: 'open',
        deadline: '2026-08-15',
      },
    ];
  }

  async listPurchaseOrders(): Promise<ErpPurchaseOrder[]> {
    return [
      {
        externalId: 'coupa_po_8842',
        supplierName: 'Nordic Components AB',
        amount: 142000,
        currency: 'EUR',
        status: 'approved',
        createdAt: '2026-06-01T10:00:00Z',
      },
    ];
  }

  async syncAwardDecision(_eventExternalId: string, _offerId: string): Promise<ErpSyncResult> {
    return {
      success: true,
      recordsSynced: 1,
      errors: [],
      syncedAt: new Date().toISOString(),
    };
  }
}
