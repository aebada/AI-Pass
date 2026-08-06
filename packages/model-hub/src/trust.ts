import type { ModelRecord, ModelTrustScores } from './types.js';
import { defaultModelRegistry, type ModelRegistry } from './registry.js';

const DEFAULT_SCORES: ModelTrustScores = { trust: 80, reliability: 78, hallucinationRisk: 18 };

export function getModelTrust(modelId: string, registry: ModelRegistry = defaultModelRegistry): ModelTrustScores {
  const model = registry.get(modelId);
  return model?.trust ?? DEFAULT_SCORES;
}

export function getTrustReport(registry: ModelRegistry = defaultModelRegistry): Array<{
  modelId: string;
  displayName: string;
  provider: string;
  trust: ModelTrustScores;
  certified: boolean;
}> {
  return registry.list().map((m) => ({
    modelId: m.id,
    displayName: m.displayName,
    provider: m.provider,
    trust: m.trust,
    certified: m.certified,
  }));
}

export function rankByTrust(models: ModelRecord[]): ModelRecord[] {
  return [...models].sort((a, b) => {
    const scoreA = a.trust.trust + a.trust.reliability - a.trust.hallucinationRisk;
    const scoreB = b.trust.trust + b.trust.reliability - b.trust.hallucinationRisk;
    return scoreB - scoreA;
  });
}

export function isHighTrust(model: ModelRecord): boolean {
  return model.trust.trust >= 90 && model.trust.hallucinationRisk <= 10;
}

export function trustLabel(scores: ModelTrustScores): 'excellent' | 'good' | 'moderate' | 'caution' {
  const composite = scores.trust + scores.reliability - scores.hallucinationRisk;
  if (composite >= 170) return 'excellent';
  if (composite >= 150) return 'good';
  if (composite >= 130) return 'moderate';
  return 'caution';
}
