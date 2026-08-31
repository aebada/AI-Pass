import { BaseCrmAdapter } from './base.js';

export class HubSpotAdapter extends BaseCrmAdapter {
  readonly provider = 'hubspot' as const;
}
