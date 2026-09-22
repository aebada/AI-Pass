import { BaseCrmAdapter } from './base.js';

export class PipedriveAdapter extends BaseCrmAdapter {
  readonly provider = 'pipedrive' as const;
}
