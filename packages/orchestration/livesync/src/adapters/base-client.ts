import type {
  InboundEvent,
  LiveRunRequest,
  LiveRunResponse,
  LiveSyncChannelMessage,
  LiveSyncChannelTopic,
  LiveSyncEvent,
  LiveSyncHealth,
  WebhookResponse,
  WorkflowExecution,
} from '@ai-pass/shared';

export interface OfflineQueueItem {
  id: string;
  body: InboundEvent;
  idempotencyKey?: string;
  createdAt: string;
  attempts: number;
}

export interface LiveSyncClientOptions {
  baseUrl: string;
  apiPrefix?: string;
  offlineQueueKey?: string;
  autoReplay?: boolean;
}

/**
 * Base HTTP client for LiveSync API — used by web, desktop, and mobile adapters.
 */
export class LiveSyncClient {
  protected baseUrl: string;
  protected apiPrefix: string;
  protected offlineQueue: OfflineQueueItem[] = [];
  protected offlineQueueKey: string;
  protected autoReplay: boolean;
  private online = true;

  constructor(options: LiveSyncClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.apiPrefix = options.apiPrefix ?? '/api/v1';
    this.offlineQueueKey = options.offlineQueueKey ?? 'ai-pass-livesync-offline';
    this.autoReplay = options.autoReplay ?? true;
    this.loadOfflineQueue();
  }

  protected url(path: string): string {
    return `${this.baseUrl}${this.apiPrefix}${path}`;
  }

  protected async request<T>(path: string, init?: RequestInit): Promise<T> {
    try {
      const res = await fetch(this.url(path), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers,
        },
      });
      this.online = true;
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`LiveSync API ${res.status}: ${body}`);
      }
      return (await res.json()) as T;
    } catch (err) {
      this.online = false;
      throw err;
    }
  }

  isOnline(): boolean {
    return this.online;
  }

  async sendWebhook(
    event: InboundEvent,
    idempotencyKey?: string
  ): Promise<WebhookResponse> {
    try {
      const result = await this.request<WebhookResponse>('/events/webhook', {
        method: 'POST',
        body: JSON.stringify(event),
        headers: idempotencyKey ? { 'X-Idempotency-Key': idempotencyKey } : undefined,
      });
      if (this.autoReplay) await this.replayOfflineQueue();
      return result;
    } catch {
      this.enqueueOffline(event, idempotencyKey);
      return {
        status: 'accepted',
        event_id: `offline_${Date.now()}`,
        queue_status: 'queued',
      };
    }
  }

  async sendTestEvent(event: InboundEvent): Promise<WebhookResponse> {
    return this.request<WebhookResponse>('/events/test', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async runLive(request: LiveRunRequest): Promise<LiveRunResponse> {
    return this.request<LiveRunResponse>('/live/run', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getEvent(eventId: string): Promise<LiveSyncEvent> {
    return this.request<LiveSyncEvent>(`/events/${eventId}`);
  }

  async getExecution(executionId: string): Promise<WorkflowExecution> {
    return this.request<WorkflowExecution>(`/executions/${executionId}`);
  }

  async getLogs(filters?: { eventId?: string; executionId?: string }): Promise<{ logs: unknown[] }> {
    const params = new URLSearchParams();
    if (filters?.eventId) params.set('event_id', filters.eventId);
    if (filters?.executionId) params.set('execution_id', filters.executionId);
    const qs = params.toString();
    return this.request<{ logs: unknown[] }>(`/logs${qs ? `?${qs}` : ''}`);
  }

  async getHealth(): Promise<LiveSyncHealth> {
    return this.request<LiveSyncHealth>('/health');
  }

  subscribeSSE(
    onMessage: (message: LiveSyncChannelMessage) => void,
    topics?: LiveSyncChannelTopic[]
  ): () => void {
    const params = topics?.length ? `?topics=${topics.join(',')}` : '';
    const eventSource = new EventSource(this.url(`/events/stream${params}`));

    eventSource.onmessage = (ev) => {
      try {
        onMessage(JSON.parse(ev.data) as LiveSyncChannelMessage);
      } catch {
        // ignore malformed
      }
    };

    return () => eventSource.close();
  }

  enqueueOffline(event: InboundEvent, idempotencyKey?: string): void {
    this.offlineQueue.push({
      id: `off_${Date.now()}`,
      body: event,
      idempotencyKey,
      createdAt: new Date().toISOString(),
      attempts: 0,
    });
    this.persistOfflineQueue();
  }

  async replayOfflineQueue(): Promise<number> {
    if (!this.online || this.offlineQueue.length === 0) return 0;

    const pending = [...this.offlineQueue];
    this.offlineQueue = [];
    let replayed = 0;

    for (const item of pending) {
      try {
        await this.request<WebhookResponse>('/events/webhook', {
          method: 'POST',
          body: JSON.stringify(item.body),
          headers: item.idempotencyKey
            ? { 'X-Idempotency-Key': item.idempotencyKey }
            : undefined,
        });
        replayed += 1;
      } catch {
        item.attempts += 1;
        if (item.attempts < 5) this.offlineQueue.push(item);
      }
    }

    this.persistOfflineQueue();
    return replayed;
  }

  getOfflineQueueSize(): number {
    return this.offlineQueue.length;
  }

  protected loadOfflineQueue(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(this.offlineQueueKey);
      if (raw) this.offlineQueue = JSON.parse(raw) as OfflineQueueItem[];
    } catch {
      this.offlineQueue = [];
    }
  }

  protected persistOfflineQueue(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(this.offlineQueueKey, JSON.stringify(this.offlineQueue));
    } catch {
      // storage full — drop oldest
      this.offlineQueue.shift();
    }
  }
}
