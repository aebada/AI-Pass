import type { ModelCatalogFilters, ModelRecord } from './types.js';
import { defaultModelRegistry } from './registry.js';

/** Convenience accessors for UI and playground */
export function getModels(filters?: ModelCatalogFilters): ModelRecord[] {
  if (!filters || Object.keys(filters).length === 0) {
    return defaultModelRegistry.list();
  }
  return defaultModelRegistry.search(filters);
}

export function getModelById(id: string): ModelRecord | undefined {
  return defaultModelRegistry.get(id);
}

export const AIPASS_MODELS = defaultModelRegistry.list().filter((m) => m.category === 'aipass');

export const PROVIDER_DEFINITIONS = [
  { id: 'openai', name: 'OpenAI' },
  { id: 'anthropic', name: 'Claude' },
  { id: 'gemini', name: 'Gemini' },
  { id: 'mistral', name: 'Mistral' },
  { id: 'deepseek', name: 'DeepSeek' },
  { id: 'grok', name: 'Grok' },
  { id: 'openrouter', name: 'OpenRouter' },
  { id: 'groq', name: 'Groq' },
  { id: 'huggingface', name: 'Hugging Face' },
  { id: 'together', name: 'Together' },
  { id: 'fireworks', name: 'Fireworks' },
  { id: 'kimi', name: 'Kimi' },
  { id: 'ollama', name: 'Ollama' },
  { id: 'azure', name: 'Azure OpenAI' },
  { id: 'llama', name: 'Meta Llama' },
  { id: 'qwen', name: 'Qwen' },
  { id: 'cerebras', name: 'Cerebras' },
  { id: 'sambanova', name: 'SambaNova' },
  { id: 'custom', name: 'Custom' },
  { id: 'aipass', name: 'AI-Pass' },
] as const;

export type RoutingMode =
  | 'fast'
  | 'standard'
  | 'complex'
  | 'best_quality'
  | 'lowest_cost'
  | 'fastest'
  | 'most_private'
  | 'enterprise_safe'
  | 'balanced'
  | 'manual';

export interface AutoRouteRequest {
  task?: string;
  mode?: RoutingMode;
  preferred_model_id?: string;
  membership_plan?: import('./types.js').MembershipPlanGate;
  require_enterprise?: boolean;
  require_private?: boolean;
}

export interface AutoRouteResult {
  primary: ModelRecord;
  fallbacks: ModelRecord[];
  mode: RoutingMode;
  reason: string;
}

export const MODEL_CATEGORIES = [
  { id: 'aipass' as const, label: 'AI-Pass Models', description: 'Proprietary AI-Pass model family' },
  { id: 'provider' as const, label: 'Provider Models', description: 'Third-party cloud APIs' },
  { id: 'open-source' as const, label: 'Open-Source / Local', description: 'Ollama, vLLM, LM Studio' },
  { id: 'private' as const, label: 'Private Models', description: 'Customer-owned endpoints' },
];

export const MODEL_CAPABILITIES = [
  'chat', 'completion', 'reasoning', 'vision', 'embedding', 'code', 'agent', 'multimodal', 'fine-tuned', 'voice', 'tool-calling',
] as const;

export const MODEL_PROVIDERS = [...new Set(defaultModelRegistry.list().map((m) => m.provider))].sort();

export function getModelCount(): number {
  return defaultModelRegistry.count();
}

export const MODEL_REGISTRY_COUNT = defaultModelRegistry.count();

import { resolveModel } from './router.js';
import { ROUTING_RULES } from './registry.js';

export function resolveModelRoute(context: {
  appId?: string;
  workflowId?: string;
  preferredModelId?: string;
  taskType?: string;
}) {
  return resolveModel({
    appId: context.appId ?? context.workflowId,
    preferredModelId: context.preferredModelId,
    taskType: context.taskType,
  });
}

export function listRoutingRules() {
  return ROUTING_RULES;
}

export { ROUTING_RULES as DEFAULT_ROUTING_RULES };
