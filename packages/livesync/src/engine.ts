import type {
  CorrelationRecord,
  InboundEvent,
  LiveRunRequest,
  LiveRunResponse,
  LiveSyncEvent,
  LiveSyncHealth,
  TriggerMapping,
  WebhookResponse,
} from '@ai-pass/shared';
import { createId } from '@ai-pass/shared';
import { EventValidationError, EventGateway, ingestEvent } from './gateway.js';
import { EventQueue } from './queue.js';
import { RedisQueueStub } from './queue/redis-stub.js';
import { TriggerRegistry, TriggerResolver } from './triggers.js';
import { WorkflowRegistry } from './workflow-definitions.js';
import { AgentExecutor, WorkflowExecutor } from './workflow.js';
import { OutputHandler } from './output.js';
import { ExecutionLogger } from './logging.js';
import { LiveSyncChannelBus } from './channels.js';
import { ConflictResolver } from './conflict.js';
import { MonitoringService } from './monitoring.js';
import { NotificationEngine } from './notifications.js';
import { SynchronizationService } from './synchronization.js';
import { EventProcessor } from './processor.js';
import { LiveSyncSecurityService, priorityWeight, type SecurityContext } from './security.js';
import { defaultOtelStub } from './otel.js';
import { dispatchIntegrations } from './integrations/index.js';
import {
  createStore,
  type EventListFilters,
  type LiveSyncEngineOptions,
  type LiveSyncStore,
} from './types.js';

export class LiveSyncEngine {
  readonly store: LiveSyncStore;
  readonly channels: LiveSyncChannelBus;
  readonly logger: ExecutionLogger;
  readonly queue: EventQueue;
  readonly redisQueue: RedisQueueStub;
  readonly triggers: TriggerResolver;
  readonly monitoring: MonitoringService;
  readonly gateway: EventGateway;
  readonly security: LiveSyncSecurityService;
  readonly notifications: NotificationEngine;
  readonly sync: SynchronizationService;

  private triggerRegistry: TriggerRegistry;
  private workflowRegistry: WorkflowRegistry;
  private output: OutputHandler;
  private workflowExecutor: WorkflowExecutor;
  private processor: EventProcessor;
  private conflict: ConflictResolver;
  private workerTimer?: ReturnType<typeof setInterval>;
  private workerPollMs: number;
  private isProcessing = false;

  constructor(options: LiveSyncEngineOptions = {}) {
    this.store = createStore();
    this.channels = new LiveSyncChannelBus();
    this.logger = new ExecutionLogger(this.store);
    this.queue = new EventQueue();
    this.redisQueue = new RedisQueueStub(this.queue);
    if (options.useRedisQueue !== false) {
      void this.redisQueue.connect();
    }
    this.security = new LiveSyncSecurityService();
    this.gateway = new EventGateway(this.security);
    this.triggerRegistry = new TriggerRegistry();
    this.workflowRegistry = new WorkflowRegistry();
    this.triggers = new TriggerResolver(this.triggerRegistry);
    this.monitoring = new MonitoringService();
    this.notifications = new NotificationEngine(this.logger, this.channels);
    this.output = new OutputHandler(this.store, this.logger, this.channels);
    const agentExecutor = new AgentExecutor(this.logger);
    this.workflowExecutor = new WorkflowExecutor(this.logger, agentExecutor);
    this.sync = new SynchronizationService(this.logger, this.channels);
    this.conflict = new ConflictResolver();
    this.processor = new EventProcessor({
      store: this.store,
      triggers: this.triggers,
      workflowRegistry: this.workflowRegistry,
      workflowExecutor: this.workflowExecutor,
      output: this.output,
      logger: this.logger,
      channels: this.channels,
      monitoring: this.monitoring,
      sync: this.sync,
      notifications: this.notifications,
      conflict: this.conflict,
      otel: defaultOtelStub,
    });
    this.workerPollMs = options.workerPollMs ?? 250;

    for (const mapping of this.triggerRegistry.list()) {
      this.store.triggerMappings.set(mapping.id, mapping);
    }
    for (const wf of this.workflowRegistry.list()) {
      this.store.workflows.set(wf.id, wf);
    }

    if (options.autoStartWorker !== false) {
      this.startWorker();
    }
  }

  startWorker(): void {
    if (this.workerTimer) return;
    this.monitoring.setWorkerRunning(true);
    this.workerTimer = setInterval(() => {
      void this.processNext();
    }, this.workerPollMs);
    this.logger.info('system', 'worker', 'LiveSync worker started');
  }

  stopWorker(): void {
    if (this.workerTimer) {
      clearInterval(this.workerTimer);
      this.workerTimer = undefined;
    }
    this.monitoring.setWorkerRunning(false);
    this.logger.info('system', 'worker', 'LiveSync worker stopped');
  }

  async ingestWebhook(
    body: unknown,
    idempotencyKey?: string,
    context?: SecurityContext
  ): Promise<WebhookResponse> {
    try {
      const event = this.gateway.ingest(body, { idempotencyKey, context });
      return this.acceptEvent(event, idempotencyKey);
    } catch (err) {
      const message = err instanceof EventValidationError ? err.message : 'Invalid event';
      this.logger.error('event', 'gateway', message);
      return { status: 'rejected', error: message };
    }
  }

  async ingestEvent(body: InboundEvent, context?: SecurityContext): Promise<WebhookResponse> {
    return this.ingestWebhook(body, undefined, context);
  }

  async ingestTestEvent(body: InboundEvent): Promise<WebhookResponse> {
    const event = ingestEvent({ ...body, source: body.source ?? 'test-harness' });
    return this.acceptEvent(event);
  }

  private acceptEvent(event: LiveSyncEvent, idempotencyKey?: string): WebhookResponse {
    const conflict = this.conflict.check(event, idempotencyKey);
    if (conflict.action === 'reject') {
      return {
        status: 'rejected',
        event_id: conflict.existingEventId,
        error: conflict.reason,
      };
    }

    if (event.correlation_id) {
      this.trackCorrelation(event.correlation_id, event.id);
    }

    event.status = 'queued';
    this.store.events.set(event.id, event);
    this.queue.enqueue(event.id, { priority: priorityWeight(event.priority) });
    this.channels.publish('event.received', event);
    void dispatchIntegrations(event);
    this.logger.info('event', event.id, 'Event received and queued', {
      event_type: event.event_type,
      source: event.source,
      priority: event.priority,
    });

    if (conflict.action === 'defer') {
      this.logger.warn('event', event.id, conflict.reason ?? 'Deferred');
    }

    return {
      status: 'accepted',
      event_id: event.id,
      queue_status: 'queued',
    };
  }

  private trackCorrelation(correlationId: string, eventId: string): void {
    const now = new Date().toISOString();
    const existing = this.store.correlations.get(correlationId);
    if (existing) {
      existing.event_ids.push(eventId);
      existing.updated_at = now;
    } else {
      const record: CorrelationRecord = {
        correlation_id: correlationId,
        event_ids: [eventId],
        execution_ids: [],
        created_at: now,
        updated_at: now,
      };
      this.store.correlations.set(correlationId, record);
    }
  }

  async runLive(request: LiveRunRequest): Promise<LiveRunResponse> {
    const accepted = await this.ingestTestEvent({
      event_type: request.event_type,
      payload: request.payload,
      source: request.source ?? 'live-run',
    });

    if (accepted.status !== 'accepted' || !accepted.event_id) {
      throw new Error(accepted.error ?? 'Failed to accept event');
    }

    if (request.sync) {
      await this.processEventById(accepted.event_id);
    } else {
      const deadline = Date.now() + 10_000;
      while (Date.now() < deadline) {
        const current = this.store.events.get(accepted.event_id);
        if (current?.status === 'processed' || current?.status === 'failed') break;
        await this.processNext();
        await sleep(50);
      }
    }

    const execution = [...this.store.workflowExecutions.values()].find(
      (e) => e.event_id === accepted.event_id
    );

    return {
      event_id: accepted.event_id,
      execution_id: execution?.id ?? '',
      status: execution?.status ?? 'pending',
      decision: execution?.decision,
      confidence: execution?.confidence,
      result: execution?.result,
    };
  }

  listEvents(filters: EventListFilters = {}): LiveSyncEvent[] {
    let events = [...this.store.events.values()];
    if (filters.tenantId) events = events.filter((e) => e.tenant_id === filters.tenantId);
    if (filters.eventType) events = events.filter((e) => e.event_type === filters.eventType);
    if (filters.status) events = events.filter((e) => e.status === filters.status);
    if (filters.since) events = events.filter((e) => e.received_at >= filters.since!);
    events.sort((a, b) => b.received_at.localeCompare(a.received_at));
    if (filters.limit) events = events.slice(0, filters.limit);
    return events;
  }

  getEvent(eventId: string): LiveSyncEvent | undefined {
    return this.store.events.get(eventId);
  }

  getExecution(executionId: string) {
    return this.store.workflowExecutions.get(executionId);
  }

  listExecutions(eventId?: string) {
    const all = [...this.store.workflowExecutions.values()];
    return eventId ? all.filter((e) => e.event_id === eventId) : all;
  }

  listAgentExecutions(workflowExecutionId?: string) {
    const all = [...this.store.agentExecutions.values()];
    return workflowExecutionId
      ? all.filter((e) => e.workflow_execution_id === workflowExecutionId)
      : all;
  }

  listTriggers(): TriggerMapping[] {
    return this.triggerRegistry.list();
  }

  registerTrigger(mapping: Omit<TriggerMapping, 'id'> & { id?: string }): TriggerMapping {
    const entry = this.triggerRegistry.register(mapping);
    this.store.triggerMappings.set(entry.id, entry);
    return entry;
  }

  async retryEvent(eventId: string): Promise<WebhookResponse> {
    const event = this.store.events.get(eventId);
    if (!event) return { status: 'rejected', error: 'Event not found' };
    event.status = 'queued';
    event.retry_count += 1;
    event.error = undefined;
    this.queue.enqueue(eventId, { priority: priorityWeight(event.priority) });
    this.monitoring.recordRetry();
    this.logger.info('event', eventId, 'Event manually retried');
    return { status: 'accepted', event_id: eventId, queue_status: 'queued' };
  }

  async replayEvent(eventId: string): Promise<WebhookResponse> {
    const original = this.store.events.get(eventId);
    if (!original) return { status: 'rejected', error: 'Event not found' };

    const replay = ingestEvent({
      event_type: original.event_type,
      source: `${original.source}:replay`,
      payload: original.payload,
      tenant_id: original.tenant_id,
      org_id: original.org_id,
      user_id: original.user_id,
      correlation_id: original.correlation_id ?? `replay_${createId()}`,
      metadata: { ...original.metadata, replay_of: eventId },
      priority: original.priority,
    });

    return this.acceptEvent(replay);
  }

  getDeadLetters() {
    return this.queue.getDeadLetters();
  }

  replayDeadLetter(jobId: string) {
    return this.queue.replayDeadLetter(jobId);
  }

  getHealth(): LiveSyncHealth {
    const health = this.monitoring.getHealth(this.queue);
    this.channels.publish('health.changed', health);
    return health;
  }

  getMetrics() {
    return this.monitoring.getMetrics();
  }

  getLiveSyncMetrics() {
    return this.monitoring.getLiveSyncMetrics(this.queue);
  }

  getQueueStats() {
    return this.queue.getStats();
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing) return;
    const job = this.queue.dequeue();
    if (!job) return;

    this.isProcessing = true;
    try {
      await this.processEventById(job.eventId);
      this.queue.complete(job);
    } catch (err) {
      const failResult = this.queue.fail(job);
      const event = this.store.events.get(job.eventId);
      if (event) {
        event.retry_count = job.attempts;
        if (!failResult.retry) {
          event.status = 'failed';
          event.error = err instanceof Error ? err.message : 'Processing failed';
        } else {
          event.status = 'retrying';
        }
      }
      this.logger.error('queue', job.id, 'Job processing failed', {
        attempts: job.attempts,
        retry: failResult.retry,
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      this.isProcessing = false;
      this.channels.publish('queue.status', this.queue.getStats());
    }
  }

  private async processEventById(eventId: string): Promise<void> {
    await this.processor.process(eventId);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let defaultEngine: LiveSyncEngine | undefined;

export function getLiveSyncEngine(): LiveSyncEngine {
  if (!defaultEngine) {
    defaultEngine = new LiveSyncEngine();
  }
  return defaultEngine;
}

export function resetLiveSyncEngine(): void {
  defaultEngine?.stopWorker();
  defaultEngine = undefined;
}
