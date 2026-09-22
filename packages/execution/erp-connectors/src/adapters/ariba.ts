import type { ErpConnectionConfig, ErpPurchaseOrder, ErpSourcingEvent, ErpSyncResult } from '../types.js';

/** SAP Ariba adapter stub */
export class AribaAdapter {
  constructor(_config: ErpConnectionConfig) {}

  async listSourcingEvents(): Promise<ErpSourcingEvent[]> {
    return [
      {
        externalId: 'ariba_rfx_2201',
        title: 'Facilities Maintenance Contract',
        status: 'collecting',
        deadline: '2026-09-30',
      },
    ];
  }

  async listPurchaseOrders(): Promise<ErpPurchaseOrder[]> {
    return [
      {
        externalId: 'ariba_po_55102',
        supplierName: 'GlobalTech Solutions',
        amount: 89000,
        currency: 'USD',
        status: 'submitted',
        createdAt: '2026-05-20T14:00:00Z',
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
