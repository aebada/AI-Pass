import { BaseCrmAdapter } from './base.js';

export class SalesforceAdapter extends BaseCrmAdapter {
  readonly provider = 'salesforce' as const;
}
