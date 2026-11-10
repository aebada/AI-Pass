import type { MembershipTier } from '@ai-pass/shared';
import type { ContentDashboard, ContentUsage, DetectionResult, HumanizeResult } from '../types.js';
import { getContentLimits } from '../membership-gates.js';
import { BatchService } from './batch-service.js';
import { DetectorService } from './detector-service.js';
import { HistoryService } from './history-service.js';
import { HumanizerService } from './humanizer-service.js';

export class ContentAIPlatform {
  readonly detector: DetectorService;
  readonly humanizer: HumanizerService;
  readonly batch: BatchService;
  readonly history: HistoryService;

  constructor(seedDetections: DetectionResult[] = [], seedHumanizations: HumanizeResult[] = []) {
    this.detector = new DetectorService(seedDetections);
    this.humanizer = new HumanizerService(seedHumanizations);
    this.batch = new BatchService(this.detector, this.humanizer);
    this.history = new HistoryService(this.detector, this.humanizer);
  }

  getUsage(tenantId: string, tier: MembershipTier): ContentUsage {
    const limits = getContentLimits(tier);
    const detectsUsed = this.detector.getMonthlyCount(tenantId);
    const humanizesUsed = this.humanizer.getMonthlyCount(tenantId);
    const detections = this.detector.list(tenantId);
    const humanizations = this.humanizer.list(tenantId);
    const creditsUsed =
      detections.reduce((s, d) => s + d.creditsUsed, 0) +
      humanizations.reduce((s, h) => s + h.creditsUsed, 0);

    return {
      tenantId,
      tier,
      detectsUsed,
      detectsLimit: limits.detectsPerMonth,
      humanizesUsed,
      humanizesLimit: limits.humanizesPerMonth,
      creditsUsed,
      batchJobsThisMonth: this.batch.list(tenantId).length,
    };
  }

  getDashboard(tenantId: string, tier: MembershipTier = 'professional'): ContentDashboard {
    const detections = this.detector.list(tenantId);
    const humanizations = this.humanizer.list(tenantId);
    const avgAi =
      detections.length > 0
        ? Math.round(detections.reduce((s, d) => s + d.aiScore, 0) / detections.length)
        : 0;

    return {
      tenantId,
      recentDetections: detections.slice(0, 5),
      recentHumanizations: humanizations.slice(0, 5),
      usage: this.getUsage(tenantId, tier),
      avgAiScore: avgAi,
      totalScans: detections.length,
      totalHumanized: humanizations.length,
    };
  }
}

