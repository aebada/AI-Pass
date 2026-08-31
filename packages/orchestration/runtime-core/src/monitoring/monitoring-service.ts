import type { Execution, Plan } from '../types.js';

export interface RuntimeMonitoringSnapshot {
  timestamp: string;
  executions: {
    total: number;
    completed: number;
    failed: number;
    needsInfo: number;
    avgConfidence: number;
    avgLatencyMs: number;
  };
  credits: {
    totalConsumed: number;
    lastHour: number;
  };
  providers: {
    routed: number;
    fallbacks: number;
  };
  skills: {
    invocations: number;
  };
  workflows: {
    runs: number;
  };
  marketplace: {
    appRuns: number;
  };
  agents: {
    runs: number;
  };
  trust: {
    lowConfidenceRate: number;
  };
}

export class RuntimeMonitoringService {
  private executionHistory: Execution[] = [];
  private skillInvocations = 0;
  private workflowRuns = 0;
  private marketplaceRuns = 0;
  private providerFallbacks = 0;

  recordExecution(execution: Execution): void {
    this.executionHistory.push(execution);
    if (this.executionHistory.length > 500) {
      this.executionHistory.shift();
    }
  }

  recordSkillInvocation(): void {
    this.skillInvocations += 1;
  }

  recordWorkflowRun(): void {
    this.workflowRuns += 1;
  }

  recordMarketplaceRun(): void {
    this.marketplaceRuns += 1;
  }

  recordProviderFallback(): void {
    this.providerFallbacks += 1;
  }

  getMetrics(): RuntimeMonitoringSnapshot {
    const execs = this.executionHistory;
    const completed = execs.filter((e) => e.status === 'completed');
    const failed = execs.filter((e) => e.status === 'failed');
    const needsInfo = execs.filter((e) => e.status === 'needs_info');

    const avgConfidence =
      execs.length > 0
        ? execs.reduce((s, e) => s + (e.output?.confidence ?? e.metrics.confidence), 0) / execs.length
        : 0;

    const avgLatency =
      execs.length > 0
        ? execs.reduce((s, e) => s + e.metrics.totalDurationMs, 0) / execs.length
        : 0;

    const totalCredits = execs.reduce((s, e) => s + e.metrics.creditsUsed, 0);
    const hourAgo = Date.now() - 3600_000;
    const lastHour = execs
      .filter((e) => new Date(e.startedAt).getTime() >= hourAgo)
      .reduce((s, e) => s + e.metrics.creditsUsed, 0);

    return {
      timestamp: new Date().toISOString(),
      executions: {
        total: execs.length,
        completed: completed.length,
        failed: failed.length,
        needsInfo: needsInfo.length,
        avgConfidence: Math.round(avgConfidence * 100) / 100,
        avgLatencyMs: Math.round(avgLatency),
      },
      credits: {
        totalConsumed: totalCredits,
        lastHour,
      },
      providers: {
        routed: execs.length,
        fallbacks: this.providerFallbacks,
      },
      skills: { invocations: this.skillInvocations },
      workflows: { runs: this.workflowRuns },
      marketplace: { appRuns: this.marketplaceRuns },
      agents: { runs: execs.length },
      trust: {
        lowConfidenceRate: execs.length > 0 ? needsInfo.length / execs.length : 0,
      },
    };
  }
}

export const defaultRuntimeMonitoring = new RuntimeMonitoringService();

export function recordPlanMetrics(_plan: Plan): void {
  // Hook for future plan-level analytics
}
