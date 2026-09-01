import type { MembershipTier } from '@ai-pass/shared';
import { defaultMembershipService } from '@ai-pass/membership';
import type { ModelCatalog } from './catalog.js';
import { defaultModelCatalog, defaultProviderRegistry } from './catalog.js';
import type { ModelCatalogEntry, RoutingCriteria, RoutingDecision } from './types.js';

const TASK_MODEL_PREFERENCES: Record<string, string[]> = {
  chat: ['gpt-4o', 'claude-sonnet-4', 'gemini-flash'],
  completion: ['gpt-4o-mini', 'codestral', 'claude-haiku'],
  agent: ['gpt-5', 'claude-sonnet-4', 'deepseek-v3'],
  code: ['codestral', 'deepseek-v3', 'gpt-5'],
  reasoning: ['o3-mini', 'deepseek-r1', 'claude-opus-4'],
  vision: ['gpt-4o', 'gemini-pro'],
  embedding: ['gpt-4o-mini'],
  benchmark: ['gpt-5', 'claude-opus-4', 'gemini-pro'],
};

export class RoutingEngine {
  constructor(
    private catalog: ModelCatalog = defaultModelCatalog,
    private membership = defaultMembershipService,
  ) {}

  select(criteria: RoutingCriteria): RoutingDecision {
    if (criteria.preferredModelId) {
      const preferred = this.catalog.get(criteria.preferredModelId);
      if (preferred && this.isModelAllowed(preferred, criteria.membershipTier, criteria.orgId)) {
        return this.buildDecision(preferred, `User-selected model: ${preferred.displayName}`);
      }
    }

    const candidates = this.catalog
      .list()
      .filter((m) => m.availability !== 'unavailable')
      .filter((m) => this.isModelAllowed(m, criteria.membershipTier, criteria.orgId));

    if (candidates.length === 0) {
      const fallback = this.catalog.get('gpt-4o-mini') ?? this.catalog.list()[0];
      return this.buildDecision(fallback, 'Fallback: no eligible models for tier');
    }

    const taskPrefs = TASK_MODEL_PREFERENCES[criteria.taskType] ?? [];
    for (const prefId of taskPrefs) {
      const match = candidates.find((m) => m.id === prefId);
      if (match) {
        return this.buildDecision(match, `Task-optimized for ${criteria.taskType}`);
      }
    }

    const sorted = [...candidates].sort((a, b) => this.scoreModel(a, b, criteria));
    const best = sorted[0];
    return this.buildDecision(best, this.routingReason(best, criteria));
  }

  getFallbackChain(primary: ModelCatalogEntry, tier: MembershipTier): ModelCatalogEntry[] {
    const fallbacks = this.catalog
      .list()
      .filter((m) => m.id !== primary.id && m.availability === 'available')
      .filter((m) => this.isModelAllowed(m, tier))
      .sort((a, b) => {
        if (a.providerId === primary.providerId) return -1;
        if (b.providerId === primary.providerId) return 1;
        return a.inputCostPer1M - b.inputCostPer1M;
      });
    return fallbacks.slice(0, 3);
  }

  private isModelAllowed(model: ModelCatalogEntry, tier: MembershipTier, orgId?: string): boolean {
    if (!this.membership.canAccessModel(tier, model.id, model.tier, model.providerId)) return false;
    if (orgId && this.membership.isModelBlocked(orgId, model.id)) return false;
    if (orgId && !this.membership.isProviderAllowed(orgId, model.providerId)) return false;
    return true;
  }

  private scoreModel(a: ModelCatalogEntry, b: ModelCatalogEntry, criteria: RoutingCriteria): number {
    return this.modelScore(b, criteria) - this.modelScore(a, criteria);
  }

  private modelScore(model: ModelCatalogEntry, criteria: RoutingCriteria): number {
    let score = 0;
    const qualityRank = { good: 1, great: 2, frontier: 3 };
    const speedRank = { fast: 3, balanced: 2, quality: 1 };
    const isLocal = model.providerId === 'ollama' || model.tags.includes('local');

    if (criteria.preferQuality) score += qualityRank[model.quality] * 10;
    if (criteria.preferSpeed) score += speedRank[model.speed] * 10;
    if (criteria.preferCost) score += 10 - Math.min(model.inputCostPer1M, 10);
    if (criteria.preferPrivacy || criteria.preferLocal) score += isLocal ? 25 : -4;
    if (criteria.preferCompliance) {
      score += model.tier === 'frontier' || model.tier === 'premium' ? 12 : 4;
      if (isLocal) score += 8;
    }
    if (criteria.preferReasoning) {
      score += model.bestUseCases.some((u) => /reason|agent|code/i.test(u)) ? 14 : 0;
      score += qualityRank[model.quality] * 4;
    }
    if (criteria.preferContext) score += Math.min(model.contextLength / 8000, 20);

    score += qualityRank[model.quality] * 2;
    score += speedRank[model.speed];

    if (criteria.maxLatencyMs && model.speed === 'quality') score -= 3;
    if (model.availability === 'degraded') score -= 5;
    return score;
  }

  private routingReason(model: ModelCatalogEntry, criteria: RoutingCriteria): string {
    const parts: string[] = [`Selected ${model.displayName}`];
    if (criteria.preferSpeed) parts.push('optimized for latency');
    if (criteria.preferQuality) parts.push('optimized for quality');
    if (criteria.preferCost) parts.push('optimized for cost');
    if (criteria.preferPrivacy) parts.push('optimized for privacy');
    if (criteria.preferCompliance) parts.push('optimized for compliance');
    if (criteria.preferReasoning) parts.push('optimized for reasoning');
    if (criteria.preferContext) parts.push('optimized for context window');
    if (criteria.preferLocal) parts.push('preferring local / air-gapped');
    return parts.join(' — ');
  }

  private buildDecision(model: ModelCatalogEntry, reason: string): RoutingDecision {
    const provider = defaultProviderRegistry.get(model.providerId)!;
    const fallbacks = this.getFallbackChain(model, 'professional');
    return {
      model,
      provider,
      reason,
      fallbackModelIds: fallbacks.map((m) => m.id),
    };
  }
}

export const defaultRoutingEngine = new RoutingEngine();
