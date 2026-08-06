/**
 * Model Hub bridge — all model resolution MUST go through @ai-pass/model-hub.
 * Do not call OpenAI/Claude/Gemini APIs directly; use ProviderHub.streamChat instead.
 */
import { resolveModel as hubResolveModel, type RoutingContext } from '@ai-pass/model-hub';
import type { MembershipTier } from '@ai-pass/shared';
import type { ModelCatalogEntry } from './types.js';
import { defaultModelCatalog } from './catalog.js';

export interface ResolveModelOptions {
  appId?: string;
  taskType?: string;
  preferredModelId?: string;
  membershipTier?: MembershipTier;
  autoSelect?: boolean;
}

function tierToPlan(tier: MembershipTier): import('@ai-pass/model-hub').MembershipPlanGate {
  if (tier === 'enterprise') return 'enterprise';
  if (tier === 'power') return 'power';
  if (tier === 'professional') return 'professional';
  return 'free';
}

/** Resolve model via Model Hub — canonical entry point for all routing */
export function resolveModel(options: ResolveModelOptions = {}) {
  const context: RoutingContext = {
    appId: options.appId,
    taskType: options.taskType,
    preferredModelId: options.preferredModelId,
    membershipTier: tierToPlan(options.membershipTier ?? 'free'),
    autoSelect: options.autoSelect,
  };

  const resolution = hubResolveModel(context);
  const hubEntry = defaultModelCatalog.get(resolution.hubModelId);

  return {
    ...resolution,
    catalogEntry: hubEntry as ModelCatalogEntry | undefined,
  };
}
