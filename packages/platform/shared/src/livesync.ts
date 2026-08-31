/** LiveSync Engine shared types — aligned with platform spec */

import type { AgentDecision } from './platform.js';

export type { AgentDecision };

export type LiveSyncEventStatus =
  | 'received'
  | 'queued'
  | 'processing'
  | 'processed'
  | 'failed'
  | 'retrying';

export type WorkflowExecutionStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type EventPriority = 'low' | 'normal' | 'high' | 'critical';

export type TriggerTargetType =
  | 'workflow'
  | 'agent'
  | 'marketplace_app'
  | 'automation'
  | 'notification'
  | 'external_api';

/** Canonical event types — custom.* supported via prefix match */
export const LIVESYNC_EVENT_TYPES = [
  'invoice.uploaded',
  'supplier.updated',
  'customer.created',
  'user.registered',
  'policy.updated',
  'agent.executed',
  'workflow.completed',
  'analysis.finished',
  'knowledge.updated',
  'marketplace.installed',
  'model.changed',
  'trust.validation.completed',
  'compliance.risk.created',
] as const;

export type LiveSyncEventType = (typeof LIVESYNC_EVENT_TYPES)[number] | `custom.${string}`;

export interface InboundEvent {
  event_type: string;
  source?: string;
  timestamp?: string;
  tenant_id?: string;
  org_id?: string;
  user_id?: string;
  correlation_id?: string;
  metadata?: Record<string, unknown>;
  priority?: EventPriority;
  payload: Record<string, unknown>;
}

export interface LiveSyncEvent {
  id: string;
  event_type: string;
  source: string;
  tenant_id?: string;
  org_id?: string;
  user_id?: string;
  correlation_id?: string;
  metadata?: Record<string, unknown>;
  priority: EventPriority;
  payload: Record<string, unknown>;
  normalized_payload: Record<string, unknown>;
  status: LiveSyncEventStatus;
  received_at: string;
  processed_at?: string;
  retry_count: number;
  error?: string;
}

export interface TriggerCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'exists' | 'contains';
  value?: unknown;
}

export interface TriggerMapping {
  id: string;
  event_type: string;
  workflow_id: string;
  agent_name?: string;
  target_type?: TriggerTargetType;
  target_id?: string;
  notification_channels?: string[];
  conditions: TriggerCondition[];
  is_active: boolean;
}

export interface WorkflowStep {
  id: string;
  type: 'agent' | 'transform' | 'notify' | 'knowledge_sync' | 'governance_check';
  name: string;
  config?: Record<string, unknown>;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  event_id: string;
  status: WorkflowExecutionStatus;
  started_at: string;
  finished_at?: string;
  result_summary?: string;
  decision?: AgentDecision;
  confidence?: number;
  result?: Record<string, unknown>;
}

export interface AgentExecution {
  id: string;
  workflow_execution_id: string;
  agent_name: string;
  input_payload: Record<string, unknown>;
  output_payload: Record<string, unknown>;
  decision: AgentDecision;
  confidence: number;
  started_at: string;
  finished_at: string;
}

export interface ExecutionLog {
  id: string;
  execution_type: 'event' | 'workflow' | 'agent' | 'queue' | 'system';
  reference_id: string;
  level: LogLevel;
  message: string;
  metadata_json?: Record<string, unknown>;
  created_at: string;
}

export interface LiveSyncHealth {
  status: 'ok' | 'degraded' | 'error';
  queue: 'healthy' | 'backlogged' | 'error';
  worker: 'healthy' | 'stopped' | 'error';
  database: 'healthy' | 'error';
  pending_events: number;
  processed_total: number;
}

export interface WebhookResponse {
  status: 'accepted' | 'rejected';
  event_id?: string;
  queue_status?: 'queued' | 'processing';
  error?: string;
}

export interface LiveRunRequest {
  event_type: string;
  payload: Record<string, unknown>;
  source?: string;
  sync?: boolean;
}

export interface LiveRunResponse {
  execution_id: string;
  event_id: string;
  status: WorkflowExecutionStatus;
  decision?: AgentDecision;
  confidence?: number;
  result?: Record<string, unknown>;
}

export type LiveSyncChannelTopic =
  | 'event.received'
  | 'event.processed'
  | 'execution.started'
  | 'execution.completed'
  | 'execution.failed'
  | 'queue.status'
  | 'health.changed'
  | 'notification.sent'
  | 'sync.updated'
  | 'alert.raised';

export interface EventLogEntry {
  id: string;
  event_id: string;
  level: LogLevel;
  message: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface DeadLetterRecord {
  job_id: string;
  event_id: string;
  attempts: number;
  failed_at: string;
  error?: string;
}

export interface NotificationRecord {
  id: string;
  event_id?: string;
  channel: 'email' | 'sms' | 'push' | 'slack' | 'teams' | 'webhook' | 'voice';
  recipient: string;
  status: 'pending' | 'sent' | 'failed';
  created_at: string;
  sent_at?: string;
  error?: string;
}

export interface CorrelationRecord {
  correlation_id: string;
  event_ids: string[];
  execution_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface LiveSyncMetrics {
  eventsPerSecond: number;
  queueLength: number;
  avgProcessingMs: number;
  failureRate: number;
  retryRate: number;
  deadLetterCount: number;
  throughputPerMinute: number;
  latencyP95Ms: number;
}

export interface LiveSyncChannelMessage<T = unknown> {
  topic: LiveSyncChannelTopic;
  timestamp: string;
  payload: T;
}
