import type { AgentMetrics, Execution, StudioMonitoringSnapshot } from '../types.js';

export class MonitoringService {
  private executions: Execution[] = [];
  private providerUsage = new Map<string, number>();
  private skillUsage = new Map<string, number>();

  recordExecution(execution: Execution): void {
    this.executions.push(execution);
    for (const step of execution.steps) {
      if (step.skillId) {
        this.skillUsage.set(step.skillId, (this.skillUsage.get(step.skillId) ?? 0) + 1);
      }
    }
  }

  getSnapshot(): StudioMonitoringSnapshot {
    const total = this.executions.length;
    const completed = this.executions.filter((e) => e.status === 'completed');
    const failed = this.executions.filter((e) => e.status === 'failed');
    const running = this.executions.filter((e) => e.status === 'running');

    const avgConfidence =
      completed.length > 0
        ? completed.reduce((s, e) => s + (e.output?.confidence ?? 0), 0) / completed.length
        : 0;

    const avgLatency =
      completed.length > 0
        ? completed.reduce((s, e) => s + (e.latencyMs ?? 0), 0) / completed.length
        : 0;

    const failureRate = total > 0 ? failed.length / total : 0;
    const creditsConsumed = this.executions.reduce((s, e) => s + e.creditsUsed, 0);

    let health: StudioMonitoringSnapshot['health'] = 'healthy';
    if (failureRate > 0.3) health = 'critical';
    else if (failureRate > 0.1 || avgConfidence < 0.6) health = 'degraded';

    return {
      executionCount: total,
      runningCount: running.length,
      failureRate,
      avgConfidence,
      avgLatencyMs: Math.round(avgLatency),
      creditsConsumed,
      providerUsage: Object.fromEntries(this.providerUsage),
      skillUsage: Object.fromEntries(this.skillUsage),
      health,
    };
  }

  getAgentMetrics(agentId: string): AgentMetrics {
    const agentExecs = this.executions.filter((e) => e.agentId === agentId);
    const completed = agentExecs.filter((e) => e.status === 'completed');
    const failed = agentExecs.filter((e) => e.status === 'failed');

    return {
      agentId,
      executionCount: agentExecs.length,
      successRate: agentExecs.length > 0 ? completed.length / agentExecs.length : 0,
      avgConfidence:
        completed.length > 0
          ? completed.reduce((s, e) => s + (e.output?.confidence ?? 0), 0) / completed.length
          : 0,
      avgLatencyMs:
        completed.length > 0
          ? Math.round(completed.reduce((s, e) => s + (e.latencyMs ?? 0), 0) / completed.length)
          : 0,
      creditsUsed: agentExecs.reduce((s, e) => s + e.creditsUsed, 0),
      failureCount: failed.length,
      lastExecutedAt: agentExecs[agentExecs.length - 1]?.startedAt,
    };
  }

  listRecent(limit = 10): Execution[] {
    return [...this.executions]
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, limit);
  }
}
