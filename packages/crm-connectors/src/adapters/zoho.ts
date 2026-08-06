import { BaseCrmAdapter } from './base.js';

export class ZohoAdapter extends BaseCrmAdapter {
  readonly provider = 'zoho' as const;
}
