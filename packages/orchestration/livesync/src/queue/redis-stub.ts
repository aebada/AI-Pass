import type { EventQueue, QueueStats } from '../queue.js';

/** Redis-backed queue stub — delegates to in-memory queue in dev */
export class RedisQueueStub {
  private connected = false;

  constructor(private fallback: EventQueue) {}

  async connect(redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379'): Promise<void> {
    this.connected = true;
    console.info(`[LiveSync] Redis queue stub connected to ${redisUrl} (in-memory fallback active)`);
  }

  isConnected(): boolean {
    return this.connected;
  }

  enqueue(eventId: string, options?: { priority?: number; delayMs?: number }) {
    return this.fallback.enqueue(eventId, options);
  }

  dequeue() {
    return this.fallback.dequeue();
  }

  complete(job: Parameters<EventQueue['complete']>[0]) {
    return this.fallback.complete(job);
  }

  fail(job: Parameters<EventQueue['fail']>[0]) {
    return this.fallback.fail(job);
  }

  getStats(): QueueStats {
    return this.fallback.getStats();
  }

  getDeadLetters() {
    return this.fallback.getDeadLetters();
  }

  replayDeadLetter(jobId: string) {
    return this.fallback.replayDeadLetter(jobId);
  }
}
