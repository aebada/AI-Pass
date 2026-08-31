import type { CrmConnectionConfig, CrmProvider, CrmTicketPayload, CrmUpdateResult } from '../types.js';
import { BaseCrmAdapter } from './base.js';

export class CustomRestAdapter extends BaseCrmAdapter {
  readonly provider: CrmProvider = 'custom';

  override async connect(config: CrmConnectionConfig): Promise<{ connected: boolean; stubbed: boolean }> {
    if (!config.baseUrl) {
      throw new Error('Custom REST adapter requires baseUrl');
    }
    return super.connect(config);
  }

  override async createTicket(payload: CrmTicketPayload): Promise<CrmUpdateResult> {
    const baseUrl = this.config?.baseUrl ?? 'https://api.example.com';
    return {
      success: true,
      externalId: `custom_${Date.now()}`,
      provider: 'custom',
      message: `POST ${baseUrl}/tickets — "${payload.subject}" (stub)`,
      stubbed: true,
    };
  }
}
