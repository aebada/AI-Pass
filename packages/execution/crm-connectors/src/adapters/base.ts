import type {
  CrmAdapter,
  CrmConnectionConfig,
  CrmContact,
  CrmProvider,
  CrmTicketPayload,
  CrmUpdateResult,
} from '../types.js';

export abstract class BaseCrmAdapter implements CrmAdapter {
  abstract readonly provider: CrmProvider;
  protected config: CrmConnectionConfig | null = null;

  async connect(config: CrmConnectionConfig): Promise<{ connected: boolean; stubbed: boolean }> {
    this.config = config;
    return { connected: true, stubbed: true };
  }

  async getContact(email: string): Promise<CrmContact | null> {
    return {
      externalId: `${this.provider}_${email.replace(/[@.]/g, '_')}`,
      email,
      name: email.split('@')[0] ?? 'Customer',
      metadata: { provider: this.provider, stub: true },
    };
  }

  async updateContact(contact: CrmContact): Promise<CrmUpdateResult> {
    return {
      success: true,
      externalId: contact.externalId ?? `${this.provider}_${Date.now()}`,
      provider: this.provider,
      message: `Contact updated via ${this.provider} adapter (stub)`,
      stubbed: true,
    };
  }

  async createTicket(payload: CrmTicketPayload): Promise<CrmUpdateResult> {
    return {
      success: true,
      externalId: `${this.provider}_ticket_${Date.now()}`,
      provider: this.provider,
      message: `Ticket "${payload.subject}" created (stub)`,
      stubbed: true,
    };
  }

  async updateTicket(externalId: string, patch: Partial<CrmTicketPayload>): Promise<CrmUpdateResult> {
    return {
      success: true,
      externalId,
      provider: this.provider,
      message: `Ticket updated: ${Object.keys(patch).join(', ')} (stub)`,
      stubbed: true,
    };
  }
}
