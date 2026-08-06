import type { MembershipPlanGate, ModelRecord, ModelRouteResolution, RoutingContext } from './types.js';
import type { AutoRouteRequest, AutoRouteResult, RoutingMode } from './catalog.js';
import { defaultModelRegistry, ROUTING_RULES, type ModelRegistry } from './registry.js';
import { canAccessModel } from './membership.js';

const PLAN_RANK: Record<MembershipPlanGate, number> = {
  free: 0,
  professional: 1,
  power: 2,
  enterprise: 3,
};

function isAllowed(model: ModelRecord, plan: MembershipPlanGate): boolean {
  return PLAN_RANK[plan] >= PLAN_RANK[model.minPlan];
}

function estimateCredits(model: ModelRecord, estimatedOutputTokens = 500): number {
  const base = Math.max(1, Math.ceil(estimatedOutputTokens / 1000));
  const tierMult = { free: 0.5, standard: 1, premium: 2, frontier: 4 };
  return Math.ceil(base * tierMult[model.pricing.tier] * model.pricing.outputCreditsPer1K);
}

function scoreForAutoSelect(model: ModelRecord, taskType?: string): number {
  let score = model.trust.trust * 0.4 + model.trust.reliability * 0.3;
  score -= model.trust.hallucinationRisk * 0.2;
  score -= model.latencyMs * 0.01;
  if (model.benchmarkScore) score += model.benchmarkScore * 0.15;
  if (taskType === 'code' && model.capabilities.includes('code')) score += 15;
  if (taskType === 'reasoning' && model.capabilities.includes('reasoning')) score += 15;
  if (taskType === 'vision' && model.supportsVision) score += 20;
  if (model.status !== 'available') score -= 50;
  return score;
}

export function resolveModel(
  context: RoutingContext,
  registry: ModelRegistry = defaultModelRegistry,
): ModelRouteResolution {
  const plan = context.membershipTier ?? 'free';

  if (context.preferredModelId && !context.autoSelect) {
    const preferred = registry.get(context.preferredModelId);
    if (preferred && isAllowed(preferred, plan) && canAccessModel(plan, preferred.id)) {
      const rule = context.appId ? registry.getRoutingRule(context.appId) : undefined;
      return buildResolution(preferred, `User-selected: ${preferred.displayName}`, rule?.fallbackChain ?? []);
    }
  }

  const rule = context.appId ? registry.getRoutingRule(context.appId) : undefined;
  if (rule) {
    for (const modelId of [rule.defaultModelId, ...rule.fallbackChain]) {
      const model = registry.get(modelId);
      if (model && isAllowed(model, plan) && canAccessModel(plan, model.id) && model.status === 'available') {
        return buildResolution(
          model,
          `App routing (${rule.appName}): ${model.displayName}`,
          rule.fallbackChain.filter((id) => id !== model.id),
        );
      }
    }
  }

  if (context.autoSelect) {
    const candidates = registry
      .list()
      .filter((m) => m.status === 'available' && isAllowed(m, plan) && canAccessModel(plan, m.id));
    const best = [...candidates].sort(
      (a, b) => scoreForAutoSelect(b, context.taskType) - scoreForAutoSelect(a, context.taskType),
    )[0];
    if (best) {
      return buildResolution(best, `Auto-selected best model for ${context.taskType ?? 'chat'}`, []);
    }
  }

  const fallback = registry.get('gpt-4o-mini') ?? registry.list()[0];
  return buildResolution(fallback, 'Global fallback', ['gemini-flash', 'claude-haiku', 'deepseek-free']);
}

function buildResolution(
  model: ModelRecord,
  reason: string,
  fallbackChain: string[],
): ModelRouteResolution {
  return {
    modelId: model.id,
    model,
    providerId: model.providerId,
    hubModelId: model.hubModelId ?? model.id,
    endpoint: model.endpoint,
    reason,
    fallbackChain,
    estimatedCredits: estimateCredits(model),
  };
}

export class ModelRouter {
  constructor(private registry: ModelRegistry = defaultModelRegistry) {}

  resolve(context: RoutingContext): ModelRouteResolution {
    return resolveModel(context, this.registry);
  }

  getFallbackChain(modelId: string, plan: MembershipPlanGate = 'free'): ModelRecord[] {
    const primary = this.registry.get(modelId);
    if (!primary) return [];
    const rule = ROUTING_RULES.find((r) => r.defaultModelId === modelId || r.fallbackChain.includes(modelId));
    const chain = rule?.fallbackChain ?? ['gpt-4o-mini', 'gemini-flash', 'claude-haiku'];
    return chain
      .map((id) => this.registry.get(id))
      .filter((m): m is ModelRecord => m !== undefined && isAllowed(m, plan));
  }
}

export const defaultModelRouter = new ModelRouter();

function scoreForMode(model: ModelRecord, mode: RoutingMode, taskType?: string): number {
  switch (mode) {
    case 'fast':
    case 'fastest':
      return 500 - model.latencyMs + (1000 - model.pricing.inputCreditsPer1K * 10);
    case 'complex':
    case 'best_quality':
      return model.trust.trust * 2 + (model.benchmarkScore ?? 0) * 10;
    case 'standard':
    case 'balanced': {
      const perf = model.trust.trust + (model.benchmarkScore ?? 50) / 2;
      const cost = model.pricing.inputCreditsPer1K + model.pricing.outputCreditsPer1K;
      return perf / (1 + cost);
    }
    case 'lowest_cost':
      return 1000 - model.pricing.inputCreditsPer1K - model.pricing.outputCreditsPer1K;
    case 'most_private':
      return (model.isLocal ? 100 : 0) + (model.category === 'private' ? 50 : 0);
    case 'enterprise_safe':
      return (model.isEnterprise ? 50 : 0) + (model.certified ? 30 : 0) + model.trust.trust;
  }
  return scoreForAutoSelect(model, taskType);
}

/** Mode-aware routing for Model Hub UI and API */
export function autoRoute(request: AutoRouteRequest): AutoRouteResult {
  const mode = request.mode ?? 'balanced';
  const plan = request.membership_plan ?? 'free';
  const task = request.task ?? 'chat';

  if (mode === 'manual' && request.preferred_model_id) {
    const preferred = defaultModelRegistry.get(request.preferred_model_id);
    if (preferred) {
      return {
        primary: preferred,
        fallbacks: defaultModelRouter.getFallbackChain(preferred.id, plan),
        mode,
        reason: `Manual: ${preferred.displayName}`,
      };
    }
  }

  const candidates = defaultModelRegistry
    .list()
    .filter((m) => m.status === 'available' && isAllowed(m, plan) && canAccessModel(plan, m.id));

  if (mode === 'enterprise_safe') {
    const enterprise = candidates.filter((m) => m.isEnterprise && m.certified);
    if (enterprise.length) {
      const best = [...enterprise].sort((a, b) => scoreForMode(b, mode, task) - scoreForMode(a, mode, task))[0];
      return {
        primary: best,
        fallbacks: defaultModelRouter.getFallbackChain(best.id, plan),
        mode,
        reason: `Enterprise-safe routing for ${task}`,
      };
    }
  }

  if (mode === 'most_private') {
    const privateModels = candidates.filter((m) => m.isLocal || m.category === 'private');
    if (privateModels.length) {
      const best = privateModels[0];
      return {
        primary: best,
        fallbacks: defaultModelRouter.getFallbackChain(best.id, plan),
        mode,
        reason: 'Most private deployment selected',
      };
    }
  }

  const best = [...candidates].sort((a, b) => scoreForMode(b, mode, task) - scoreForMode(a, mode, task))[0]
    ?? defaultModelRegistry.get('gpt-4o-mini')
    ?? defaultModelRegistry.list()[0];

  return {
    primary: best,
    fallbacks: defaultModelRouter.getFallbackChain(best.id, plan),
    mode,
    reason: `${mode} routing for ${task}`,
  };
}

export function getFallbackChain(modelId: string, plan: MembershipPlanGate = 'free'): ModelRecord[] {
  return defaultModelRouter.getFallbackChain(modelId, plan);
}
