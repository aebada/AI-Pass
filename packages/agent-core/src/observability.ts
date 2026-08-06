import type { ObservabilityMetrics } from './types.js';

export interface ObservabilityEvent {
  type: 'lifecycle' | 'tool' | 'provider' | 'escalation' | 'retry' | 'error';
  executionId: string;
  agentId: string;
  timestamp: string;
  payload: Record<string, unknown>;
}

export interface ObservabilityCollectorOptions {
  maxEvents?: number;
  onRecord?: (metrics: ObservabilityMetrics) => void;
}

/**
 * Collects per-execution observability metrics for Agent Studio monitoring.
 * Feeds AgentRegistry usage stats and monitoring dashboards.
 */
export class AgentObservabilityCollector {
  private metrics = new Map<string, ObservabilityMetrics>();
  private events: ObservabilityEvent[] = [];
  private readonly maxEvents: number;
  private readonly onRecord?: (metrics: ObservabilityMetrics) => void;

  constructor(options: ObservabilityCollectorOptions = {}) {
    this.maxEvents = options.maxEvents ?? 500;
    this.onRecord = options.onRecord;
  }

  start(executionId: string, agentId: string, modelId: string, provider: string): ObservabilityMetrics {
    const now = new Date().toISOString();
    const entry: ObservabilityMetrics = {
      executionId,
      agentId,
      executionTimeMs: 0,
      tokenUsage: { input: 0, output: 0, total: 0 },
      provider,
      modelId,
      costUsd: 0,
      creditsUsed: 0,
      retries: 0,
      failures: 0,
      confidence: 0,
      toolUsage: [],
      apiLatencyMs: 0,
      humanEscalations: 0,
      lifecycle: {
        phase: 'initializing',
        status: 'pending',
        startedAt: now,
        updatedAt: now,
      },
      recordedAt: now,
    };
    this.metrics.set(executionId, entry);
    return entry;
  }

  recordTokens(executionId: string, input: number, output: number): void {
    const m = this.metrics.get(executionId);
    if (!m) return;
    m.tokenUsage = { input, output, total: input + output };
  }

  recordToolCall(executionId: string, toolId: string, latencyMs: number): void {
    const m = this.metrics.get(executionId);
    if (!m) return;
    const existing = m.toolUsage.find((t) => t.toolId === toolId);
    if (existing) {
      existing.count += 1;
      existing.latencyMs = (existing.latencyMs + latencyMs) / 2;
    } else {
      m.toolUsage.push({ toolId, count: 1, latencyMs });
    }
    this.pushEvent({ type: 'tool', executionId, agentId: m.agentId, timestamp: new Date().toISOString(), payload: { toolId, latencyMs } });
  }

  recordRetry(executionId: string): void {
    const m = this.metrics.get(executionId);
    if (m) m.retries += 1;
    this.pushEvent({ type: 'retry', executionId, agentId: m?.agentId ?? '', timestamp: new Date().toISOString(), payload: {} });
  }

  recordFailure(executionId: string, error: string): void {
    const m = this.metrics.get(executionId);
    if (m) m.failures += 1;
    this.pushEvent({ type: 'error', executionId, agentId: m?.agentId ?? '', timestamp: new Date().toISOString(), payload: { error } });
  }

  recordEscalation(executionId: string, reason: string): void {
    const m = this.metrics.get(executionId);
    if (m) m.humanEscalations += 1;
    this.pushEvent({ type: 'escalation', executionId, agentId: m?.agentId ?? '', timestamp: new Date().toISOString(), payload: { reason } });
  }

  finalize(executionId: string, patch: Partial<ObservabilityMetrics>): ObservabilityMetrics | undefined {
    const m = this.metrics.get(executionId);
    if (!m) return undefined;

    const finalized: ObservabilityMetrics = {
      ...m,
      ...patch,
      recordedAt: new Date().toISOString(),
    };
    this.metrics.set(executionId, finalized);
    this.onRecord?.(finalized);
    return finalized;
  }

  get(executionId: string): ObservabilityMetrics | undefined {
    return this.metrics.get(executionId);
  }

  list(agentId?: string): ObservabilityMetrics[] {
    const all = [...this.metrics.values()];
    return agentId ? all.filter((m) => m.agentId === agentId) : all;
  }

  getEvents(executionId?: string): ObservabilityEvent[] {
    return executionId ? this.events.filter((e) => e.executionId === executionId) : [...this.events];
  }

  private pushEvent(event: ObservabilityEvent): void {
    this.events.push(event);
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }
}

let defaultCollector: AgentObservabilityCollector | undefined;

export function getAgentObservabilityCollector(options?: ObservabilityCollectorOptions): AgentObservabilityCollector {
  if (!defaultCollector) defaultCollector = new AgentObservabilityCollector(options);
  return defaultCollector;
}

export function resetAgentObservabilityCollector(): void {
  defaultCollector = undefined;
}
