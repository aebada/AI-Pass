import type { ComparisonDimension, ModelComparisonResult, ModelRecord } from './types.js';
import { defaultModelRegistry, type ModelRegistry } from './registry.js';
import { rankByTrust } from './trust.js';

export function compareModels(
  modelIds: string[],
  registry: ModelRegistry = defaultModelRegistry,
): ModelComparisonResult {
  const models = modelIds
    .map((id) => registry.get(id))
    .filter((m): m is ModelRecord => m !== undefined);

  if (models.length === 0) {
    return { models: [], dimensions: [], summary: 'No models found for comparison.' };
  }

  const dimensions: ComparisonDimension[] = [
    {
      key: 'pricing',
      label: 'Pricing tier',
      values: Object.fromEntries(models.map((m) => [m.id, m.pricing.tier])),
    },
    {
      key: 'context',
      label: 'Context length',
      values: Object.fromEntries(models.map((m) => [m.id, m.contextLength.toLocaleString()])),
    },
    {
      key: 'latency',
      label: 'Avg latency (ms)',
      values: Object.fromEntries(models.map((m) => [m.id, m.latencyMs])),
    },
    {
      key: 'trust',
      label: 'Trust score',
      values: Object.fromEntries(models.map((m) => [m.id, m.trust.trust])),
    },
    {
      key: 'hallucination',
      label: 'Hallucination risk',
      values: Object.fromEntries(models.map((m) => [m.id, m.trust.hallucinationRisk])),
    },
    {
      key: 'benchmark',
      label: 'Benchmark score',
      values: Object.fromEntries(models.map((m) => [m.id, m.benchmarkScore ?? '—'])),
    },
    {
      key: 'vision',
      label: 'Vision',
      values: Object.fromEntries(models.map((m) => [m.id, m.supportsVision ? 'Yes' : 'No'])),
    },
    {
      key: 'tools',
      label: 'Tool calling',
      values: Object.fromEntries(models.map((m) => [m.id, m.supportsToolCalling ? 'Yes' : 'No'])),
    },
  ];

  const ranked = rankByTrust(models);
  const winner = ranked[0]?.id;
  const summary =
    models.length === 1
      ? `${models[0].displayName} — ${models[0].description}`
      : `Compared ${models.length} models. Highest trust: ${ranked[0]?.displayName ?? 'N/A'}.`;

  return { models, dimensions, winner, summary };
}

export const BENCHMARK_SUITES = [
  { id: 'mmlu', name: 'MMLU', description: 'Massive Multitask Language Understanding' },
  { id: 'humaneval', name: 'HumanEval', description: 'Code generation benchmark' },
  { id: 'gsm8k', name: 'GSM8K', description: 'Grade school math reasoning' },
  { id: 'mt-bench', name: 'MT-Bench', description: 'Multi-turn conversation quality' },
] as const;

export function getBenchmarkScores(
  modelIds: string[],
  suiteId: string,
  registry: ModelRegistry = defaultModelRegistry,
): Array<{ modelId: string; displayName: string; score: number }> {
  const suiteBoost: Record<string, number> = {
    mmlu: 0,
    humaneval: 5,
    gsm8k: 3,
    'mt-bench': 2,
  };
  const boost = suiteBoost[suiteId] ?? 0;

  return modelIds
    .map((id) => registry.get(id))
    .filter((m): m is ModelRecord => m !== undefined)
    .map((m) => ({
      modelId: m.id,
      displayName: m.displayName,
      score: Math.min(100, (m.benchmarkScore ?? 75) + boost + (m.capabilities.includes('code') ? 3 : 0)),
    }))
    .sort((a, b) => b.score - a.score);
}
