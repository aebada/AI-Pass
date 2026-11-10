import { BaseCrmAdapter } from './base.js';

export class ZendeskAdapter extends BaseCrmAdapter {
  readonly provider = 'zendesk' as const;
}
