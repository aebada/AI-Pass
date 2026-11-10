import { defaultCrmRegistry, type CrmProvider } from '@ai-pass/crm-connectors';
import { createId } from '@ai-pass/shared';
import type { CRMRecord, Customer } from '../types.js';

export class CrmService {
  private records = new Map<string, CRMRecord>();
  private activeProvider: CrmProvider = 'zendesk';

  setProvider(provider: CrmProvider): void {
    this.activeProvider = provider;
  }

  async connect(tenantId: string, provider: CrmProvider, config?: { baseUrl?: string }) {
    const adapter = defaultCrmRegistry.get(provider);
    if (!adapter) throw new Error(`Unknown CRM provider: ${provider}`);
    return adapter.connect({
      provider,
      tenantId,
      baseUrl: config?.baseUrl,
    });
  }

  async syncCustomer(tenantId: string, customer: Customer) {
    const adapter = defaultCrmRegistry.get(this.activeProvider);
    if (!adapter) throw new Error('CRM adapter not configured');

    const result = await adapter.updateContact({
      externalId: customer.crmExternalId,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
    });

    const record: CRMRecord = {
      id: `crm_${createId()}`,
      tenantId,
      provider: this.activeProvider,
      externalId: result.externalId ?? customer.id,
      entityType: 'contact',
      data: { email: customer.email, name: customer.name },
      syncedAt: new Date().toISOString(),
    };
    this.records.set(record.id, record);
    return { record, stubbed: result.stubbed };
  }

  async updateRecord(params: {
    tenantId: string;
    provider: CrmProvider;
    entityType: CRMRecord['entityType'];
    entityId: string;
    data: Record<string, unknown>;
  }) {
    const adapter = defaultCrmRegistry.get(params.provider);
    if (!adapter) throw new Error(`Unknown CRM provider: ${params.provider}`);

    let result;
    if (params.entityType === 'ticket') {
      result = await adapter.updateTicket(params.entityId, {
        subject: String(params.data.subject ?? ''),
        description: String(params.data.description ?? ''),
      });
    } else {
      result = await adapter.updateContact({
        externalId: params.entityId,
        email: String(params.data.email ?? ''),
        name: String(params.data.name ?? 'Customer'),
      });
    }

    const record: CRMRecord = {
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

  listRecords(tenantId: string): CRMRecord[] {
    return [...this.records.values()].filter((r) => r.tenantId === tenantId);
  }
}
