import { resolveModel as hubResolve, autoRoute } from '@ai-pass/model-hub';
import type { MembershipTier } from '@ai-pass/shared';
import type { ModelCatalogEntry, RoutingCriteria, RoutingDecision } from './types.js';
import { defaultModelCatalog, defaultProviderRegistry } from './catalog.js';

const TIER_MAP: Record<MembershipTier, import('@ai-pass/model-hub').MembershipPlanGate> = {
  free: 'free',
  professional: 'professional',
  power: 'power',
  enterprise: 'enterprise',
};

export interface ResolveModelOptions {
  task?: string;
  mode?: import('@ai-pass/model-hub').RoutingMode;
  modelId?: string;
  membershipTier?: MembershipTier;
  appId?: string;
  autoSelect?: boolean;
}

/**
 * Resolve a model through Model Hub routing.
 * All modules must use this (via Provider Hub) — no direct provider calls.
 */
export function resolveModel(options: ResolveModelOptions = {}) {
  if (options.mode && options.mode !== 'manual') {
    const routed = autoRoute({
      task: options.task,
      mode: options.mode,
      preferred_model_id: options.modelId,
      membership_plan: TIER_MAP[options.membershipTier ?? 'free'],
    });
    return {
      primary: routed.primary,
      fallbacks: routed.fallbacks,
      mode: routed.mode,
      reason: routed.reason,
      hubResolution: hubResolve({
        preferredModelId: routed.primary.id,
        membershipTier: TIER_MAP[options.membershipTier ?? 'free'],
        taskType: options.task,
        appId: options.appId,
        autoSelect: options.autoSelect,
      }),
    };
  }

  const hubResolution = hubResolve({
    preferredModelId: options.modelId,
    membershipTier: TIER_MAP[options.membershipTier ?? 'free'],
    taskType: options.task,
    appId: options.appId,
    autoSelect: options.autoSelect ?? !options.modelId,
  });

  return {
    primary: hubResolution.model,
    fallbacks: hubResolution.fallbackChain
      .map((id) => defaultModelCatalog.get(id))
      .filter(Boolean),
    reason: hubResolution.reason,
    hubResolution,
  };
}

/** Bridge Model Hub result to legacy Provider Hub RoutingDecision */
export function resolveModelForHub(criteria: RoutingCriteria): RoutingDecision {
  const result = resolveModel({
    task: criteria.taskType,
    modelId: criteria.preferredModelId,
    membershipTier: criteria.membershipTier,
    autoSelect: !criteria.preferredModelId,
  });

  const catalogEntry = bridgeToCatalogEntry(result.primary as import('@ai-pass/model-hub').ModelRecord);
  const provider = defaultProviderRegistry.get(catalogEntry.providerId);

  return {
    model: catalogEntry,
    provider: provider ?? defaultProviderRegistry.list()[0],
    reason: result.reason,
    fallbackModelIds: result.hubResolution.fallbackChain,
  };
}

function bridgeToCatalogEntry(record: import('@ai-pass/model-hub').ModelRecord): ModelCatalogEntry {
  const existing = defaultModelCatalog.get(record.id);
  if (existing) return existing;

  const speedMap = { ultra_fast: 'fast', fast: 'fast', balanced: 'balanced', quality: 'quality' } as const;
  const latencySpeed =
    record.latencyMs < 200 ? 'fast' : record.latencyMs < 600 ? 'balanced' : 'quality';

  return {
    id: record.id,
    providerId: record.providerId as ModelCatalogEntry['providerId'],
    providerName: record.provider,
    model: record.hubModelId ?? record.name,
    displayName: record.displayName,
    description: record.description,
    speed: speedMap[latencySpeed as keyof typeof speedMap] ?? latencySpeed,
    quality: record.pricing.tier === 'frontier' ? 'frontier' : record.pricing.tier === 'premium' ? 'great' : 'good',
    tier: record.pricing.tier,
    contextLength: record.contextLength,
    inputCostPer1M: record.pricing.inputCostPer1M ?? record.pricing.inputCreditsPer1K * 1000,
    outputCostPer1M: record.pricing.outputCostPer1M ?? record.pricing.outputCreditsPer1K * 1000,
    availability: record.status === 'unavailable' ? 'unavailable' : 'available',
    bestUseCases: record.useCases,
    tags: record.tags,
  };
}
