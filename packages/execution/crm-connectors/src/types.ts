export type CrmProvider =
  | 'salesforce'
  | 'hubspot'
  | 'zoho'
  | 'pipedrive'
  | 'dynamics'
  | 'monday'
  | 'zendesk'
  | 'freshdesk'
  | 'servicenow'
  | 'custom';

export interface CrmConnectionConfig {
  provider: CrmProvider;
  tenantId: string;
  baseUrl?: string;
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  instanceUrl?: string;
}

export interface CrmContact {
  externalId?: string;
  email: string;
  name: string;
  phone?: string;
  company?: string;
  metadata?: Record<string, unknown>;
}

export interface CrmTicketPayload {
  subject: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: string;
  contactEmail?: string;
  tags?: string[];
  customFields?: Record<string, unknown>;
}

export interface CrmUpdateResult {
  success: boolean;
  externalId?: string;
  provider: CrmProvider;
  message?: string;
  stubbed: boolean;
}

export interface CrmAdapter {
  readonly provider: CrmProvider;
  connect(config: CrmConnectionConfig): Promise<{ connected: boolean; stubbed: boolean }>;
  getContact(email: string): Promise<CrmContact | null>;
  updateContact(contact: CrmContact): Promise<CrmUpdateResult>;
  createTicket(payload: CrmTicketPayload): Promise<CrmUpdateResult>;
  updateTicket(externalId: string, patch: Partial<CrmTicketPayload>): Promise<CrmUpdateResult>;
}
