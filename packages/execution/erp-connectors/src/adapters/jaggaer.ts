import type { ErpConnectionConfig, ErpPurchaseOrder, ErpSourcingEvent, ErpSyncResult } from '../types.js';

/** Jaggaer adapter stub */
export class JaggaerAdapter {
  constructor(_config: ErpConnectionConfig) {}

  async listSourcingEvents(): Promise<ErpSourcingEvent[]> {
    return [
      {
        externalId: 'jag_evt_778',
        title: 'Medical Supplies Framework',
        status: 'evaluation',
        deadline: '2026-07-31',
      },
    ];
  }

  async listPurchaseOrders(): Promise<ErpPurchaseOrder[]> {
    return [
      {
        externalId: 'jag_po_3391',
        supplierName: 'MedSupply Europe',
        amount: 256000,
        currency: 'EUR',
        status: 'awarded',
        createdAt: '2026-04-10T09:00:00Z',
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
