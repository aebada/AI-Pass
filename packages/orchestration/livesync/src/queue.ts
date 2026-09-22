import type { DeadLetterRecord } from '@ai-pass/shared';
import { priorityWeight } from './security.js';
import type { QueueJob } from './types.js';

export interface QueueStats {
  pending: number;
  processing: number;
  deadLetter: number;
  delayed: number;
  totalEnqueued: number;
  totalProcessed: number;
  totalFailed: number;
  totalRetried: number;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffMs: (attempt: number) => number;
}

export interface EnqueueOptions {
  priority?: number;
  delayMs?: number;
  scheduledAt?: string;
}

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  backoffMs: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
};

export class EventQueue {
  private pending: QueueJob[] = [];
  private delayed: QueueJob[] = [];
  private processing = new Set<string>();
  private deadLetter: QueueJob[] = [];
  private retryPolicy: RetryPolicy;
  private stats = {
    totalEnqueued: 0,
    totalProcessed: 0,
    totalFailed: 0,
    totalRetried: 0,
  };

  constructor(retryPolicy: RetryPolicy = DEFAULT_RETRY_POLICY) {
    this.retryPolicy = retryPolicy;
    setInterval(() => this.flushDelayed(), 500);
  }

  enqueue(eventId: string, options: EnqueueOptions = {}): QueueJob {
    const job: QueueJob = {
      id: `job_${eventId}`,
      eventId,
      enqueuedAt: new Date().toISOString(),
      attempts: 0,
      maxAttempts: this.retryPolicy.maxAttempts,
      priority: options.priority ?? 1,
      delayMs: options.delayMs,
      scheduledAt: options.scheduledAt,
    };

    if (options.delayMs || options.scheduledAt) {
      this.delayed.push(job);
    } else {
      this.insertByPriority(job);
    }

    this.stats.totalEnqueued += 1;
    return job;
  }

  private insertByPriority(job: QueueJob): void {
    const idx = this.pending.findIndex((j) => j.priority < job.priority);
    if (idx === -1) this.pending.push(job);
    else this.pending.splice(idx, 0, job);
  }

  private flushDelayed(): void {
    const now = Date.now();
    const ready: QueueJob[] = [];
    const remaining: QueueJob[] = [];

    for (const job of this.delayed) {
      const target = job.scheduledAt
        ? new Date(job.scheduledAt).getTime()
        : new Date(job.enqueuedAt).getTime() + (job.delayMs ?? 0);
      if (target <= now) ready.push(job);
      else remaining.push(job);
    }

    this.delayed = remaining;
    for (const job of ready) this.insertByPriority(job);
  }

  dequeue(): QueueJob | undefined {
    this.flushDelayed();
    const job = this.pending.shift();
    if (job) {
      this.processing.add(job.id);
    }
    return job;
  }

  complete(job: QueueJob): void {
    this.processing.delete(job.id);
    this.stats.totalProcessed += 1;
  }

  fail(job: QueueJob): { retry: boolean; job: QueueJob } {
    this.processing.delete(job.id);
    job.attempts += 1;

    if (job.attempts < job.maxAttempts) {
      const delay = this.retryPolicy.backoffMs(job.attempts - 1);
      this.stats.totalRetried += 1;
      setTimeout(() => {
        this.insertByPriority(job);
      }, delay);
      return { retry: true, job };
    }

    this.deadLetter.push(job);
    this.stats.totalFailed += 1;
    return { retry: false, job };
  }

  getDeadLetters(): DeadLetterRecord[] {
    return this.deadLetter.map((job) => ({
      job_id: job.id,
      event_id: job.eventId,
      attempts: job.attempts,
      failed_at: new Date().toISOString(),
    }));
  }

  replayDeadLetter(jobId: string): QueueJob | undefined {
    const idx = this.deadLetter.findIndex((j) => j.id === jobId);
    if (idx === -1) return undefined;
    const [job] = this.deadLetter.splice(idx, 1);
    job.attempts = 0;
    this.insertByPriority(job);
    return job;
  }

  getStats(): QueueStats {
    return {
      pending: this.pending.length,
      processing: this.processing.size,
      deadLetter: this.deadLetter.length,
      delayed: this.delayed.length,
      ...this.stats,
    };
  }

  isHealthy(): boolean {
    return this.deadLetter.length < 100 && this.pending.length < 10_000;
  }
}

export { priorityWeight };
