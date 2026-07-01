import type { MembershipTier } from '@ai-pass/shared';
import { createId } from '@ai-pass/shared';
import { defaultWalletService } from '@ai-pass/wallet';
import type { HumanizeResult, HumanizeTone } from '../types.js';
import { CONTENT_AI_PRICING } from '../types.js';
import { canHumanize, getContentLimits } from '../membership-gates.js';
import { defaultContentProviderRouting, HUMANIZE_MODELS } from '../provider-routing.js';
import { defaultContentTrustService } from '../trust.js';
import { emitHumanizationCompleted } from '../livesync.js';

export class HumanizerService {
  private results: HumanizeResult[] = [];
  private monthlyCounts = new Map<string, number>();

  constructor(seed: HumanizeResult[] = []) {
    this.results = [...seed];
  }

  list(tenantId: string): HumanizeResult[] {
    return this.results
      .filter((r) => r.tenantId === tenantId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  get(id: string): HumanizeResult | undefined {
    return this.results.find((r) => r.id === id);
  }

  getAvailableModels(): typeof HUMANIZE_MODELS {
    return HUMANIZE_MODELS;
  }

  async humanize(params: {
    tenantId: string;
    userId: string;
    tier: MembershipTier;
    text: string;
    tone?: HumanizeTone;
    modelId?: string;
  }): Promise<HumanizeResult> {
    if (!canHumanize(params.tier)) {
      throw new Error('Humanization requires Professional membership or higher.');
    }

    const limits = getContentLimits(params.tier);
    const used = this.monthlyCounts.get(params.tenantId) ?? 0;
    if (used >= limits.humanizesPerMonth) {
      throw new Error(`Humanization limit reached (${limits.humanizesPerMonth}/month). Upgrade your plan.`);
    }

    const tone = params.tone ?? 'professional';
    const modelId = params.modelId ?? HUMANIZE_MODELS[0].id;
    const modelMeta = HUMANIZE_MODELS.find((m) => m.id === modelId) ?? HUMANIZE_MODELS[0];

    const llm = await defaultContentProviderRouting.humanizeText({
      text: params.text,
      tone,
      modelId,
      userId: params.userId,
      tenantId: params.tenantId,
      membershipTier: params.tier,
    });

    const trust = defaultContentTrustService.evaluateHumanization({
      aiScore: 0,
      confidence: 0.9,
      humanizeQuality: 0.88,
      meaningPreserved: true,
    });

    const creditsUsed = CONTENT_AI_PRICING.humanizeCredits;
    defaultWalletService.recordUsage({
      userId: params.userId,
      tenantId: params.tenantId,
      provider: modelMeta.providerId,
      model: llm.modelId,
      credits: creditsUsed,
      estimatedCostUsd: creditsUsed * 0.004,
      taskType: 'content_humanize',
      module: 'content-ai',
      metadata: { tone, modelId },
    });

    this.monthlyCounts.set(params.tenantId, used + 1);

    const result: HumanizeResult = {
      id: `hum_${createId()}`,
      tenantId: params.tenantId,
      userId: params.userId,
      originalText: params.text,
      humanizedText: llm.content.trim(),
      tone,
      modelId: llm.modelId,
      providerId: modelMeta.providerId,
      trustScore: trust.trustScore,
      creditsUsed,
      createdAt: new Date().toISOString(),
    };

    this.results.push(result);
    void emitHumanizationCompleted(result);
    return result;
  }

  getMonthlyCount(tenantId: string): number {
    return this.monthlyCounts.get(tenantId) ?? 0;
  }
}
