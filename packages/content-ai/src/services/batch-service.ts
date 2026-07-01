import type { MembershipTier } from '@ai-pass/shared';
import { createId } from '@ai-pass/shared';
import type { BatchJob, HumanizeTone } from '../types.js';
import { CONTENT_AI_PRICING } from '../types.js';
import { canAccessBatch } from '../membership-gates.js';
import type { DetectorService } from './detector-service.js';
import type { HumanizerService } from './humanizer-service.js';

export class BatchService {
  private jobs: BatchJob[] = [];

  constructor(
    private detector: DetectorService,
    private humanizer: HumanizerService,
  ) {}

  list(tenantId: string): BatchJob[] {
    return this.jobs.filter((j) => j.tenantId === tenantId);
  }

  async runBatch(params: {
    tenantId: string;
    userId: string;
    tier: MembershipTier;
    type: 'detect' | 'humanize';
    texts: string[];
    tone?: HumanizeTone;
    modelId?: string;
  }): Promise<BatchJob> {
    if (!canAccessBatch(params.tier)) {
      throw new Error('Batch processing requires Power or Enterprise plan.');
    }

    const job: BatchJob = {
      id: `batch_${createId()}`,
      tenantId: params.tenantId,
      type: params.type,
      status: 'running',
      itemCount: params.texts.length,
      completedCount: 0,
      creditsUsed: 0,
      createdAt: new Date().toISOString(),
    };
    this.jobs.push(job);

    let credits = 0;
    for (const text of params.texts) {
      if (params.type === 'detect') {
        const r = await this.detector.detect({
          tenantId: params.tenantId,
          userId: params.userId,
          tier: params.tier,
          text,
        });
        credits += r.creditsUsed;
      } else {
        const r = await this.humanizer.humanize({
          tenantId: params.tenantId,
          userId: params.userId,
          tier: params.tier,
          text,
          tone: params.tone,
          modelId: params.modelId,
        });
        credits += r.creditsUsed;
      }
      job.completedCount += 1;
    }

    job.creditsUsed = Math.round(credits * CONTENT_AI_PRICING.batchMultiplier);
    job.status = 'completed';
    return job;
  }
}
