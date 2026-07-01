import type {
  AgentDecision,
  AgentExecution,
  CorrelationRecord,
  ExecutionLog,
  LiveSyncEvent,
  NotificationRecord,
  TriggerMapping,
  WorkflowDefinition,
  WorkflowExecution,
} from '@ai-pass/shared';

export interface LiveSyncStore {
  events: Map<string, LiveSyncEvent>;
  triggerMappings: Map<string, TriggerMapping>;
  workflows: Map<string, WorkflowDefinition>;
  workflowExecutions: Map<string, WorkflowExecution>;
  agentExecutions: Map<string, AgentExecution>;
  logs: ExecutionLog[];
  correlations: Map<string, CorrelationRecord>;
  notifications: NotificationRecord[];
}

export function createStore(): LiveSyncStore {
  return {
    events: new Map(),
    triggerMappings: new Map(),
    workflows: new Map(),
    workflowExecutions: new Map(),
    agentExecutions: new Map(),
    logs: [],
    correlations: new Map(),
    notifications: [],
  };
}

export interface QueueJob {
  id: string;
  eventId: string;
  enqueuedAt: string;
  attempts: number;
  maxAttempts: number;
  priority: number;
  delayMs?: number;
  scheduledAt?: string;
}

export interface LiveSyncEngineOptions {
  maxRetries?: number;
  workerPollMs?: number;
  autoStartWorker?: boolean;
  useRedisQueue?: boolean;
}

export interface ProcessResult {
  event: LiveSyncEvent;
  execution?: WorkflowExecution;
  agentExecution?: AgentExecution;
  error?: string;
}

export interface AgentExecutorResult {
  decision: AgentDecision;
  confidence: number;
  output: Record<string, unknown>;
  explanation: string;
}

export interface EventListFilters {
  tenantId?: string;
  eventType?: string;
  status?: LiveSyncEvent['status'];
  limit?: number;
  since?: string;
}
