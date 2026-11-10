/** Platform EventBus — integrates with LiveSync for cross-module events */

export type PlatformEventType =
  | 'module.opened'
  | 'agent.started'
  | 'agent.completed'
  | 'workflow.started'
  | 'workflow.completed'
  | 'wallet.debit'
  | 'wallet.low_balance'
  | 'approval.requested'
  | 'approval.resolved'
  | 'knowledge.ingested'
  | 'marketplace.installed'
  | 'livesync.received'
  | 'livesync.processed';

export interface PlatformEvent<T = Record<string, unknown>> {
  id: string;
  type: PlatformEventType;
  tenantId: string;
  source: string;
  timestamp: string;
  payload: T;
}

export type PlatformEventHandler<T = Record<string, unknown>> = (event: PlatformEvent<T>) => void;

export interface LiveSyncBridge {
  publish(eventType: string, payload: Record<string, unknown>): void;
  subscribe(eventType: string, handler: (payload: Record<string, unknown>) => void): () => void;
}

export class PlatformEventBus {
  private handlers = new Map<PlatformEventType | '*', Set<PlatformEventHandler>>();
  private livesyncBridge?: LiveSyncBridge;
  private history: PlatformEvent[] = [];
  private maxHistory = 100;

  connectLiveSync(bridge: LiveSyncBridge): void {
    this.livesyncBridge = bridge;
    bridge.subscribe('*', (payload) => {
      this.emit({
        id: `evt_${Date.now().toString(36)}`,
        type: 'livesync.received',
        tenantId: (payload.tenantId as string) ?? 'default',
        source: 'livesync',
        timestamp: new Date().toISOString(),
        payload,
      });
    });
  }

  on(type: PlatformEventType | '*', handler: PlatformEventHandler): () => void {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type)!.add(handler);
    return () => this.handlers.get(type)?.delete(handler);
  }

  emit<T extends Record<string, unknown>>(event: PlatformEvent<T>): void {
    this.history.unshift(event);
    if (this.history.length > this.maxHistory) this.history.pop();

    this.handlers.get(event.type)?.forEach((h) => h(event as PlatformEvent));
    this.handlers.get('*')?.forEach((h) => h(event as PlatformEvent));

    if (this.livesyncBridge && event.type.startsWith('livesync.')) {
      this.livesyncBridge.publish(event.type, event.payload);
    }
  }

  getHistory(limit = 20): PlatformEvent[] {
    return this.history.slice(0, limit);
  }
}

export const defaultPlatformEventBus = new PlatformEventBus();
