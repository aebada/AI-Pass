import { BaseCrmAdapter } from './base.js';

export class ServiceNowAdapter extends BaseCrmAdapter {
  readonly provider = 'servicenow' as const;
}
