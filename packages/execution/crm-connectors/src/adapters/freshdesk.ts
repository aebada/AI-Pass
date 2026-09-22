import { BaseCrmAdapter } from './base.js';

export class FreshdeskAdapter extends BaseCrmAdapter {
  readonly provider = 'freshdesk' as const;
}
