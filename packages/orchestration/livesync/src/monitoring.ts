import type { LiveSyncHealth, LiveSyncMetrics } from '@ai-pass/shared';
import type { EventQueue } from './queue.js';

export interface ProcessingMetrics {
  avgProcessingMs: number;
  lastProcessedAt?: string;
  eventsPerMinute: number;
  errorRate: number;
  retryRate: number;
  latencyP95Ms: number;
}

export class MonitoringService {
  private processingTimes: number[] = [];
  private recentTimestamps: number[] = [];
  private errors = 0;
  private successes = 0;
  private retries = 0;
  private workerRunning = false;
  private epsWindow: number[] = [];

  setWorkerRunning(running: boolean): void {
    this.workerRunning = running;
  }

  recordProcessing(durationMs: number, success: boolean): void {
    this.processingTimes.push(durationMs);
    if (this.processingTimes.length > 100) this.processingTimes.shift();
    this.recentTimestamps.push(Date.now());
    this.epsWindow.push(Date.now());
    const cutoff = Date.now() - 60_000;
    this.recentTimestamps = this.recentTimestamps.filter((t) => t >= cutoff);
    this.epsWindow = this.epsWindow.filter((t) => t >= cutoff);
    if (success) this.successes += 1;
    else this.errors += 1;
  }

  recordRetry(): void {
    this.retries += 1;
  }

  getMetrics(): ProcessingMetrics {
    const avg =
      this.processingTimes.length > 0
        ? this.processingTimes.reduce((a, b) => a + b, 0) / this.processingTimes.length
        : 0;
    const sorted = [...this.processingTimes].sort((a, b) => a - b);
    const p95 = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.95)] ?? avg : 0;
    const total = this.successes + this.errors;
    return {
      avgProcessingMs: Math.round(avg),
      eventsPerMinute: this.recentTimestamps.length,
      errorRate: total > 0 ? this.errors / total : 0,
      retryRate: total > 0 ? this.retries / total : 0,
      latencyP95Ms: Math.round(p95),
      lastProcessedAt:
        this.recentTimestamps.length > 0
          ? new Date(this.recentTimestamps[this.recentTimestamps.length - 1]).toISOString()
          : undefined,
    };
  }

  getLiveSyncMetrics(queue: EventQueue): LiveSyncMetrics {
    const stats = queue.getStats();
    const m = this.getMetrics();
    const windowSec = 10;
    const recentEps = this.epsWindow.filter((t) => t >= Date.now() - windowSec * 1000).length / windowSec;
    return {
      eventsPerSecond: Math.round(recentEps * 100) / 100,
      queueLength: stats.pending + stats.processing + stats.delayed,
      avgProcessingMs: m.avgProcessingMs,
      failureRate: m.errorRate,
      retryRate: m.retryRate,
      deadLetterCount: stats.deadLetter,
      throughputPerMinute: m.eventsPerMinute,
      latencyP95Ms: m.latencyP95Ms,
    };
  }

  getHealth(queue: EventQueue): LiveSyncHealth {
    const stats = queue.getStats();
    const queueStatus =
      stats.deadLetter > 0 ? 'error' : stats.pending > 100 ? 'backlogged' : 'healthy';

    const workerStatus: LiveSyncHealth['worker'] = this.workerRunning ? 'healthy' : 'stopped';
    const overall =
      queueStatus === 'error'
        ? 'error'
        : queueStatus === 'backlogged' || workerStatus === 'stopped'
          ? 'degraded'
          : 'ok';

    return {
      status: overall,
      queue: queueStatus,
      worker: workerStatus,
      database: 'healthy',
      pending_events: stats.pending + stats.processing + stats.delayed,
      processed_total: stats.totalProcessed,
    };
  }
}
