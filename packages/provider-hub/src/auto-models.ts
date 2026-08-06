import type { MembershipTier } from '@ai-pass/shared';
import type { ModelCatalogEntry, ProviderHealth, TaskType } from './types.js';
import { defaultModelCatalog } from './catalog.js';
import { defaultHealthMonitor } from './health-monitor.js';
import { defaultMembershipService } from '@ai-pass/membership';

/** Auto complexity modes — route each request to the best performance-to-price model. */
export type AutoComplexity = 'fast' | 'standard' | 'complex';

export const AUTO_MODEL_IDS = {
  fast: 'auto-fast',
  standard: 'auto-standard',
  complex: 'auto-complex',
} as const;

export const AUTO_MODEL_META: Record<
  AutoComplexity,
  { id: string; displayName: string; description: string; tier: 'standard' | 'premium' | 'frontier' }
> = {
  fast: {
    id: AUTO_MODEL_IDS.fast,
    displayName: 'Auto · Fast',
    description: 'Lowest latency with strong value — routes to the best cheap/fast model available now.',
    tier: 'standard',
  },
  standard: {
    id: AUTO_MODEL_IDS.standard,
    displayName: 'Auto · Standard',
    description: 'Best performance-to-price tradeoff at this moment, with live failover.',
    tier: 'standard',
  },
  complex: {
    id: AUTO_MODEL_IDS.complex,
    displayName: 'Auto · Complex',
    description: 'Favors frontier capability for hard tasks while still optimizing cost and availability.',
    tier: 'premium',
  },
};

export function isAutoModelId(modelId: string): boolean {
  return Object.values(AUTO_MODEL_IDS).includes(modelId as (typeof AUTO_MODEL_IDS)[AutoComplexity]);
}

export function parseAutoComplexity(modelId: string): AutoComplexity | null {
  if (modelId === AUTO_MODEL_IDS.fast) return 'fast';
  if (modelId === AUTO_MODEL_IDS.standard) return 'standard';
  if (modelId === AUTO_MODEL_IDS.complex) return 'complex';
  return null;
}

const QUALITY: Record<ModelCatalogEntry['quality'], number> = { good: 1, great: 2, frontier: 3 };
const SPEED: Record<ModelCatalogEntry['speed'], number> = { fast: 3, balanced: 2, quality: 1 };

export interface AutoRouteOptions {
  complexity: AutoComplexity;
  taskType?: TaskType;
  membershipTier?: MembershipTier;
  orgId?: string;
  /** Exclude these model ids (e.g. already failed attempts). */
  excludeModelIds?: string[];
  /** Exclude these providers (e.g. known outages). */
  excludeProviderIds?: string[];
  health?: ProviderHealth[];
}

export interface AutoRouteDecision {
  complexity: AutoComplexity;
  model: ModelCatalogEntry;
  reason: string;
  score: number;
  performanceToPrice: number;
  fallbackModelIds: string[];
  considered: number;
}

/**
 * Score = performance / (1 + weighted cost).
 * Fast weights latency; Complex weights quality; Standard balances both.
 */
export function scorePerformanceToPrice(
  model: ModelCatalogEntry,
  complexity: AutoComplexity,
  taskType: TaskType = 'chat',
  health?: ProviderHealth,
): { score: number; performance: number; cost: number; ratio: number } {
  const quality = QUALITY[model.quality];
  const speed = SPEED[model.speed];
  const cost = Math.max(0.01, model.inputCostPer1M * 0.4 + model.outputCostPer1M * 0.6);

  let performance = quality * 12 + speed * 6;
  if (model.tags.includes('flagship')) performance += 8;
  if (model.tags.includes('coding') && (taskType === 'code' || taskType === 'agent')) performance += 10;
  if (model.tags.includes('reasoning') && taskType === 'reasoning') performance += 10;
  if (model.bestUseCases.some((u) => u.toLowerCase().includes('agent')) && taskType === 'agent') {
    performance += 6;
  }

  if (health?.status === 'degraded') performance *= 0.7;
  if (health?.status === 'down') performance = 0;
  if (model.availability === 'degraded') performance *= 0.75;
  if (model.availability === 'unavailable') performance = 0;

  // Complexity tilts the objective
  let costWeight = 1;
  if (complexity === 'fast') {
    performance = performance * 0.55 + speed * 18;
    costWeight = 1.35;
  } else if (complexity === 'complex') {
    performance = performance * 0.7 + quality * 22;
    costWeight = 0.55;
  } else {
    // standard — pure performance-to-price
    costWeight = 1;
  }

  const ratio = performance / (1 + costWeight * Math.log10(1 + cost * 10));
  return { score: ratio, performance, cost, ratio };
}

export function selectAutoModel(options: AutoRouteOptions): AutoRouteDecision {
  const taskType = options.taskType ?? 'chat';
  const tier = options.membershipTier ?? 'professional';
  const healthList = options.health ?? defaultHealthMonitor.checkAll();
  const healthByProvider = new Map(healthList.map((h) => [h.providerId, h]));
  const excludeModels = new Set(options.excludeModelIds ?? []);
  const excludeProviders = new Set(options.excludeProviderIds ?? []);

  const candidates = defaultModelCatalog
    .list()
    .filter((m) => !isAutoModelId(m.id))
    .filter((m) => !excludeModels.has(m.id))
    .filter((m) => !excludeProviders.has(m.providerId))
    .filter((m) => m.availability !== 'unavailable')
    .filter((m) => healthByProvider.get(m.providerId)?.status !== 'down')
    .filter((m) =>
      defaultMembershipService.canAccessModel(tier, m.id, m.tier, m.providerId),
    )
    .filter((m) => {
      if (!options.orgId) return true;
      if (defaultMembershipService.isModelBlocked(options.orgId, m.id)) return false;
      return defaultMembershipService.isProviderAllowed(options.orgId, m.providerId);
    });

  if (candidates.length === 0) {
    const fallback =
      defaultModelCatalog.get('gpt-4o-mini') ??
      defaultModelCatalog.get('gemini-flash') ??
      defaultModelCatalog.list()[0];
    return {
      complexity: options.complexity,
      model: fallback,
      reason: 'Emergency fallback — no healthy eligible models',
      score: 0,
      performanceToPrice: 0,
      fallbackModelIds: [],
      considered: 0,
    };
  }

  const ranked = candidates
    .map((model) => {
      const scored = scorePerformanceToPrice(
        model,
        options.complexity,
        taskType,
        healthByProvider.get(model.providerId),
      );
      return { model, ...scored };
    })
    .sort((a, b) => b.score - a.score);

  const best = ranked[0]!;

  // Prefer different providers in the failover chain for outage protection
  const fallbacks: string[] = [];
  for (const entry of ranked.slice(1)) {
    if (fallbacks.length >= 4) break;
    const sameProvider = entry.model.providerId === best.model.providerId;
    const alreadyHasOtherProvider = fallbacks.some((id) => {
      const m = defaultModelCatalog.get(id);
      return m && m.providerId !== best.model.providerId;
    });
    if (sameProvider && !alreadyHasOtherProvider && fallbacks.length < 2) {
      // allow one same-provider backup early, then diversify
    }
    if (sameProvider && alreadyHasOtherProvider) continue;
    fallbacks.push(entry.model.id);
  }

  // Ensure at least one cross-provider fallback when possible
  if (!fallbacks.some((id) => defaultModelCatalog.get(id)?.providerId !== best.model.providerId)) {
    const cross = ranked.find((e) => e.model.providerId !== best.model.providerId);
    if (cross) fallbacks.unshift(cross.model.id);
  }

  const label = AUTO_MODEL_META[options.complexity].displayName;
  return {
    complexity: options.complexity,
    model: best.model,
    reason: `${label} routed to ${best.model.displayName} (best performance-to-price of ${ranked.length} live models)`,
    score: best.score,
    performanceToPrice: best.ratio,
    fallbackModelIds: [...new Set(fallbacks)].slice(0, 4),
    considered: ranked.length,
  };
}

export function resolveAutoOrDirectModelId(
  modelId: string,
  options: Omit<AutoRouteOptions, 'complexity'> & { complexity?: AutoComplexity } = {},
): AutoRouteDecision | null {
  const complexity = parseAutoComplexity(modelId) ?? options.complexity;
  if (!complexity) return null;
  return selectAutoModel({ ...options, complexity });
}
