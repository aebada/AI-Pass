import { BaseCrmAdapter } from './base.js';

export class DynamicsAdapter extends BaseCrmAdapter {
  readonly provider = 'dynamics' as const;
}
