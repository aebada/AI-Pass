import type { LiveSyncChannelBus } from './channels.js';
import type { ExecutionLogger } from './logging.js';

export type SyncTarget =
  | 'dashboard'
  | 'widget'
  | 'report'
  | 'knowledge'
  | 'marketplace'
  | 'wallet'
  | 'crm'
  | 'erp'
  | 'mobile'
  | 'desktop';

export interface SyncPayload {
  target: SyncTarget;
  tenantId?: string;
  resourceId?: string;
  data: Record<string, unknown>;
}

export class SynchronizationService {
  private pending: SyncPayload[] = [];

  constructor(
    private logger: ExecutionLogger,
    private channels: LiveSyncChannelBus
  ) {}

  async sync(payload: SyncPayload): Promise<void> {
    this.pending.push(payload);
    this.logger.info('system', payload.target, `Sync → ${payload.target}`, {
      tenant_id: payload.tenantId,
      resource_id: payload.resourceId,
    });
    this.channels.publish('sync.updated', payload);
  }

  async syncFromExecution(
    execution: { id: string; workflow_id: string; result?: Record<string, unknown> },
    tenantId?: string
  ): Promise<void> {
    const targets: SyncTarget[] = ['dashboard', 'widget'];
    if (execution.workflow_id.includes('knowledge')) targets.push('knowledge');
    if (execution.workflow_id.includes('invoice')) targets.push('erp');
    if (execution.workflow_id.includes('marketplace')) targets.push('marketplace');

    await Promise.all(
      targets.map((target) =>
        this.sync({
          target,
          tenantId,
          resourceId: execution.id,
          data: {
            workflow_id: execution.workflow_id,
            result: execution.result,
          },
        })
      )
    );
  }

  getPending(): SyncPayload[] {
    return [...this.pending];
  }

  flush(): void {
    this.pending = [];
  }
}
