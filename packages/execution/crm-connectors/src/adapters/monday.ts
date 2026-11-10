import { BaseCrmAdapter } from './base.js';

export class MondayAdapter extends BaseCrmAdapter {
  readonly provider = 'monday' as const;
}
