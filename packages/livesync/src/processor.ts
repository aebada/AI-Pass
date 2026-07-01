import type { LiveSyncEvent, TriggerMapping } from '@ai-pass/shared';
import type { LiveSyncChannelBus } from './channels.js';
import type { ExecutionLogger } from './logging.js';
import type { MonitoringService } from './monitoring.js';
import type { NotificationEngine } from './notifications.js';
import type { OutputHandler } from './output.js';
import type { SynchronizationService } from './synchronization.js';
import type { TriggerResolver } from './triggers.js';
import type { LiveSyncStore } from './types.js';
import type { WorkflowRegistry } from './workflow-definitions.js';
import type { WorkflowExecutor } from './workflow.js';
import type { ConflictResolver } from './conflict.js';
import type { OtelStub } from './otel.js';

export interface ProcessContext {
  store: LiveSyncStore;
  triggers: TriggerResolver;
  workflowRegistry: WorkflowRegistry;
  workflowExecutor: WorkflowExecutor;
  output: OutputHandler;
  logger: ExecutionLogger;
  channels: LiveSyncChannelBus;
  monitoring: MonitoringService;
  sync: SynchronizationService;
  notifications: NotificationEngine;
  conflict: ConflictResolver;
  otel?: OtelStub;
}

export class EventProcessor {
  constructor(private ctx: ProcessContext) {}

  async process(eventId: string): Promise<void> {
    const event = this.ctx.store.events.get(eventId);
    if (!event || event.status === 'processed') return;

    const span = this.ctx.otel?.startSpan('event.process', { event_id: eventId, event_type: event.event_type });
    const started = Date.now();
    event.status = 'processing';
    this.ctx.conflict.markProcessing(event.event_type);
    this.ctx.channels.publish('queue.status', { eventId, status: 'processing' });

    const trigger = this.ctx.triggers.resolve(event.event_type, event.normalized_payload);
    if (!trigger) {
      await this.failEvent(event, `No matching trigger for event type: ${event.event_type}`, started);
      if (span) this.ctx.otel?.endSpan(span);
      return;
    }

    await this.executeTrigger(event, trigger, started);
    if (span) this.ctx.otel?.endSpan(span);
  }

  private async executeTrigger(
    event: LiveSyncEvent,
    trigger: TriggerMapping,
    started: number
  ): Promise<void> {
    this.ctx.logger.info('event', event.id, `Trigger resolved → ${trigger.workflow_id}`, {
      target_type: trigger.target_type ?? 'workflow',
    });

    if (trigger.target_type === 'notification') {
      await this.ctx.notifications.send({
        channel: (trigger.notification_channels?.[0] as 'email') ?? 'email',
        recipient: String(event.tenant_id ?? 'admin@tenant.local'),
        body: `Event ${event.event_type} triggered notification`,
        eventId: event.id,
      });
      event.status = 'processed';
      event.processed_at = new Date().toISOString();
      this.ctx.monitoring.recordProcessing(Date.now() - started, true);
      return;
    }

    const workflow = this.ctx.workflowRegistry.get(trigger.workflow_id);
    if (!workflow) {
      await this.failEvent(event, `Workflow not found: ${trigger.workflow_id}`, started);
      return;
    }

    const execution = this.ctx.output.persistWorkflowExecution({
      workflow_id: workflow.id,
      event_id: event.id,
      status: 'running',
    });
    this.ctx.channels.publish('execution.started', execution);

    try {
      const result = await this.ctx.workflowExecutor.run(
        workflow,
        event.normalized_payload,
        execution.id,
        trigger.agent_name
      );

      this.ctx.output.persistAgentExecution(
        execution.id,
        trigger.agent_name ?? 'default-agent',
        event.normalized_payload,
        result.result,
        result.decision,
        result.confidence
      );

      const completed = this.ctx.output.updateExecutionStatus(execution.id, 'completed', {
        decision: result.decision,
        confidence: result.confidence,
        result: result.result,
        result_summary: `${result.decision} (${(result.confidence * 100).toFixed(0)}% confidence)`,
      });

      if (completed) {
        this.ctx.output.propagateToSyncLayer(completed);
        await this.ctx.sync.syncFromExecution(completed, event.tenant_id);
      }

      event.status = 'processed';
      event.processed_at = new Date().toISOString();
      this.ctx.channels.publish('event.processed', event);
      this.ctx.monitoring.recordProcessing(Date.now() - started, true);
    } catch (err) {
      this.ctx.output.updateExecutionStatus(execution.id, 'failed', {
        result_summary: err instanceof Error ? err.message : 'Workflow failed',
      });
      event.status = 'failed';
      event.error = err instanceof Error ? err.message : 'Workflow failed';
      event.processed_at = new Date().toISOString();
      this.ctx.monitoring.recordProcessing(Date.now() - started, false);
      throw err;
    } finally {
      this.ctx.conflict.markComplete(event.event_type);
    }
  }

  private async failEvent(event: LiveSyncEvent, error: string, started: number): Promise<void> {
    event.status = 'failed';
    event.error = error;
    event.processed_at = new Date().toISOString();
    this.ctx.conflict.markComplete(event.event_type);
    this.ctx.monitoring.recordProcessing(Date.now() - started, false);
    this.ctx.logger.error('event', event.id, error);
    this.ctx.channels.publish('alert.raised', { event_id: event.id, error });
  }
}
