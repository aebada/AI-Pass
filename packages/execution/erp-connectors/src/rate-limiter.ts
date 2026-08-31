export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 60,
  windowMs: 60_000,
  maxRetries: 3,
  baseDelayMs: 500,
  maxDelayMs: 30_000,
};

export class RateLimiter {
  private timestamps: number[] = [];

  constructor(private config: RateLimitConfig = DEFAULT_RATE_LIMIT) {}

  async acquire(): Promise<void> {
    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < this.config.windowMs);

    if (this.timestamps.length >= this.config.maxRequests) {
      const oldest = this.timestamps[0]!;
      const waitMs = this.config.windowMs - (now - oldest) + 50;
      await sleep(waitMs);
      return this.acquire();
    }

    this.timestamps.push(Date.now());
  }
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt >= config.maxRetries) break;
      const delay = Math.min(config.baseDelayMs * 2 ** attempt, config.maxDelayMs);
      await sleep(delay);
    }
  }
  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
