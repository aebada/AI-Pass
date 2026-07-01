import { CustomRestAdapter } from './adapters/custom-rest.js';
import { DynamicsAdapter } from './adapters/dynamics.js';
import { FreshdeskAdapter } from './adapters/freshdesk.js';
import { HubSpotAdapter } from './adapters/hubspot.js';
import { MondayAdapter } from './adapters/monday.js';
import { PipedriveAdapter } from './adapters/pipedrive.js';
import { SalesforceAdapter } from './adapters/salesforce.js';
import { ServiceNowAdapter } from './adapters/servicenow.js';
import { ZendeskAdapter } from './adapters/zendesk.js';
import { ZohoAdapter } from './adapters/zoho.js';
import type { CrmAdapter, CrmConnectionConfig, CrmProvider } from './types.js';

export class CrmAdapterRegistry {
  private adapters = new Map<CrmProvider, CrmAdapter>();

  constructor() {
    this.register(new SalesforceAdapter());
    this.register(new HubSpotAdapter());
    this.register(new ZohoAdapter());
    this.register(new PipedriveAdapter());
    this.register(new DynamicsAdapter());
    this.register(new MondayAdapter());
    this.register(new ZendeskAdapter());
    this.register(new FreshdeskAdapter());
    this.register(new ServiceNowAdapter());
    this.register(new CustomRestAdapter());
  }

  register(adapter: CrmAdapter): void {
    this.adapters.set(adapter.provider, adapter);
  }

  get(provider: CrmProvider): CrmAdapter | undefined {
    return this.adapters.get(provider);
  }

  list(): CrmProvider[] {
    return [...this.adapters.keys()];
  }

  async connect(provider: CrmProvider, config: CrmConnectionConfig) {
    const adapter = this.adapters.get(provider);
    if (!adapter) throw new Error(`CRM provider not supported: ${provider}`);
    return adapter.connect(config);
  }
}

export const defaultCrmRegistry = new CrmAdapterRegistry();
