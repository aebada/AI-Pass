import { defaultCrmRegistry, type CrmProvider } from '@ai-pass/crm-connectors';
import { createId } from '@ai-pass/shared';
import type { Contact, Deal, Lead } from '../types.js';

export interface CrmSyncRecord {
  id: string;
  tenantId: string;
  provider: CrmProvider;
  externalId: string;
  entityType: 'lead' | 'contact' | 'deal';
  data: Record<string, unknown>;
  syncedAt: string;
}

const SALES_CRM_PROVIDERS: CrmProvider[] = [
  'salesforce', 'hubspot', 'dynamics', 'zoho', 'pipedrive', 'monday', 'custom',
];

export class CrmService {
  private records = new Map<string, CrmSyncRecord>();
  private activeProvider: CrmProvider = 'hubspot';

  listProviders(): CrmProvider[] {
    return SALES_CRM_PROVIDERS.filter((p) => defaultCrmRegistry.get(p));
  }

  setProvider(provider: CrmProvider): void {
    this.activeProvider = provider;
  }

  async connect(tenantId: string, provider: CrmProvider, config?: { baseUrl?: string }) {
    const adapter = defaultCrmRegistry.get(provider);
    if (!adapter) throw new Error(`Unknown CRM provider: ${provider}`);
    return adapter.connect({ provider, tenantId, baseUrl: config?.baseUrl });
  }

  async syncLead(tenantId: string, lead: Lead, contact?: Contact) {
    const adapter = defaultCrmRegistry.get(this.activeProvider);
    if (!adapter) throw new Error('CRM adapter not configured');

    const result = await adapter.updateContact({
      externalId: lead.crmExternalId,
      email: contact?.email ?? `${lead.company.toLowerCase().replace(/\s/g, '')}@example.com`,
      name: contact?.name ?? lead.company,
      company: lead.company,
      metadata: { score: lead.score, status: lead.status, industry: lead.industry },
    });

    const record: CrmSyncRecord = {
      id: `crm_${createId()}`,
      tenantId,
      provider: this.activeProvider,
      externalId: result.externalId ?? lead.id,
      entityType: 'lead',
      data: { company: lead.company, score: lead.score, status: lead.status },
      syncedAt: new Date().toISOString(),
    };
    this.records.set(record.id, record);
    return { record, stubbed: result.stubbed };
  }

  async syncDeal(tenantId: string, deal: Deal) {
    const adapter = defaultCrmRegistry.get(this.activeProvider);
    if (!adapter) throw new Error('CRM adapter not configured');

    const result = await adapter.createTicket({
      subject: `Deal: ${deal.name}`,
      description: `Value: ${deal.value} ${deal.currency}, Stage: ${deal.stage}, Probability: ${deal.probability}%`,
      customFields: { dealId: deal.id, value: deal.value, stage: deal.stage },
    });

    const record: CrmSyncRecord = {
      id: `crm_${createId()}`,
      tenantId,
      provider: this.activeProvider,
      externalId: result.externalId ?? deal.id,
      entityType: 'deal',
      data: { name: deal.name, value: deal.value, stage: deal.stage },
      syncedAt: new Date().toISOString(),
    };
    this.records.set(record.id, record);
    return { record, stubbed: result.stubbed };
  }

  async syncEntity(params: {
    tenantId: string;
    provider: CrmProvider;
    entityType: 'lead' | 'contact' | 'deal';
    entityId: string;
    data: Record<string, unknown>;
  }) {
    const adapter = defaultCrmRegistry.get(params.provider);
    if (!adapter) throw new Error(`Unknown CRM provider: ${params.provider}`);

    const result = await adapter.updateContact({
      externalId: params.entityId,
      email: String(params.data.email ?? 'contact@example.com'),
      name: String(params.data.name ?? 'Contact'),
      company: String(params.data.company ?? ''),
    });

    const record: CrmSyncRecord = {
      id: `crm_${createId()}`,
      tenantId: params.tenantId,
      provider: params.provider,
      externalId: result.externalId ?? params.entityId,
      entityType: params.entityType,
      data: params.data,
      syncedAt: new Date().toISOString(),
    };
    this.records.set(record.id, record);
    return { record, stubbed: result.stubbed };
  }

  listRecords(tenantId: string): CrmSyncRecord[] {
    return [...this.records.values()].filter((r) => r.tenantId === tenantId);
  }
}
