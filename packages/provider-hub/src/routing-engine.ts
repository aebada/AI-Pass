import type { MembershipTier } from '@ai-pass/shared';
import { defaultMembershipService } from '@ai-pass/membership';
import type { ModelCatalog } from './catalog.js';
import { defaultModelCatalog, defaultProviderRegistry } from './catalog.js';
import type { ModelCatalogEntry, RoutingCriteria, RoutingDecision } from './types.js';
import {
  isAutoModelId,
  parseAutoComplexity,
  selectAutoModel,
  type AutoComplexity,
} from './auto-models.js';
import { defaultHealthMonitor } from './health-monitor.js';

const TASK_MODEL_PREFERENCES: Record<string, string[]> = {
  chat: ['gpt-4o', 'claude-sonnet-5', 'gemini-3.6-flash', 'kimi-k2.6'],
  completion: ['gpt-4o-mini', 'codestral', 'claude-haiku'],
  agent: ['gpt-5.6-sol', 'claude-sonnet-5', 'kimi-k3', 'deepseek-v3'],
  code: ['kimi-k2.7-code', 'codestral', 'deepseek-v3', 'gpt-5.6-terra'],
  reasoning: ['kimi-k3', 'o3-mini', 'claude-opus-5', 'deepseek-r1'],
  vision: ['gpt-4o', 'gemini-3.6-flash', 'gemini-pro'],
  embedding: ['gpt-4o-mini'],
  benchmark: ['gpt-5.6-sol', 'claude-opus-5', 'kimi-k3', 'gemini-3.1-pro'],
};

export class RoutingEngine {
  constructor(
    private catalog: ModelCatalog = defaultModelCatalog,
    private membership = defaultMembershipService,
  ) {}

  select(criteria: RoutingCriteria): RoutingDecision {
    const auto =
      criteria.autoComplexity ??
      (criteria.preferredModelId ? parseAutoComplexity(criteria.preferredModelId) : null);

    if (auto) {
      return this.selectAuto(auto, criteria);
    }

    if (criteria.preferredModelId && !isAutoModelId(criteria.preferredModelId)) {
      const preferred = this.catalog.get(criteria.preferredModelId);
      if (preferred && this.isModelAllowed(preferred, criteria.membershipTier, criteria.orgId)) {
        return this.buildDecision(preferred, `User-selected model: ${preferred.displayName}`, criteria.membershipTier);
      }
    }

    const candidates = this.catalog
      .list()
      .filter((m) => !isAutoModelId(m.id))
      .filter((m) => m.availability !== 'unavailable')
      .filter((m) => this.isModelAllowed(m, criteria.membershipTier, criteria.orgId));

    if (candidates.length === 0) {
      const fallback = this.catalog.get('gpt-4o-mini') ?? this.catalog.list()[0];
      return this.buildDecision(fallback, 'Fallback: no eligible models for tier', criteria.membershipTier);
    }

    const taskPrefs = TASK_MODEL_PREFERENCES[criteria.taskType] ?? [];
    for (const prefId of taskPrefs) {
      const match = candidates.find((m) => m.id === prefId);
      if (match) {
        return this.buildDecision(match, `Task-optimized for ${criteria.taskType}`, criteria.membershipTier);
      }
    }

    const sorted = [...candidates].sort((a, b) => this.scoreModel(a, b, criteria));
    const best = sorted[0]!;
    return this.buildDecision(best, this.routingReason(best, criteria), criteria.membershipTier);
  }

  selectAuto(complexity: AutoComplexity, criteria: RoutingCriteria): RoutingDecision {
    const decision = selectAutoModel({
      complexity,
      taskType: criteria.taskType,
      membershipTier: criteria.membershipTier,
      orgId: criteria.orgId,
      health: defaultHealthMonitor.checkAll(),
    });
    const provider = defaultProviderRegistry.get(decision.model.providerId)!;
    return {
      model: decision.model,
      provider,
      reason: decision.reason,
      fallbackModelIds: decision.fallbackModelIds,
    };
  }

  getFallbackChain(primary: ModelCatalogEntry, tier: MembershipTier): ModelCatalogEntry[] {
    const health = defaultHealthMonitor.checkAll();
    const down = new Set(health.filter((h) => h.status === 'down').map((h) => h.providerId));

    const fallbacks = this.catalog
      .list()
      .filter((m) => m.id !== primary.id && !isAutoModelId(m.id) && m.availability === 'available')
      .filter((m) => !down.has(m.providerId))
      .filter((m) => this.isModelAllowed(m, tier))
      .sort((a, b) => {
        // Diversify providers first for outage protection
        const aCross = a.providerId === primary.providerId ? 1 : 0;
        const bCross = b.providerId === primary.providerId ? 1 : 0;
        if (aCross !== bCross) return aCross - bCross;
        return a.inputCostPer1M - b.inputCostPer1M;
      });
    return fallbacks.slice(0, 4);
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

    if (criteria.preferQuality) score += qualityRank[model.quality] * 10;
    if (criteria.preferSpeed) score += speedRank[model.speed] * 10;
    if (criteria.preferCost) score += 10 - Math.min(model.inputCostPer1M, 10);

    score += qualityRank[model.quality] * 2;
    score += speedRank[model.speed];

    if (model.availability === 'degraded') score -= 5;
    return score;
  }

  private routingReason(model: ModelCatalogEntry, criteria: RoutingCriteria): string {
    const parts: string[] = [`Selected ${model.displayName}`];
    if (criteria.preferSpeed) parts.push('optimized for latency');
    if (criteria.preferQuality) parts.push('optimized for quality');
    if (criteria.preferCost) parts.push('optimized for cost');
    return parts.join(' — ');
  }

  private buildDecision(
    model: ModelCatalogEntry,
    reason: string,
    tier: MembershipTier,
  ): RoutingDecision {
    const provider = defaultProviderRegistry.get(model.providerId)!;
    const fallbacks = this.getFallbackChain(model, tier);
    return {
      model,
      provider,
      reason,
      fallbackModelIds: fallbacks.map((m) => m.id),
    };
  }
}

export const defaultRoutingEngine = new RoutingEngine();
