import type { MembershipPlanGate, ModelRecord } from './types.js';
import { defaultModelRegistry, MODEL_REGISTRY, ROUTING_RULES } from './registry.js';
import { resolveModel } from './router.js';
import {
  DEFAULT_GOVERNANCE_POLICIES,
  getGovernancePolicy,
  isModelAllowedByPolicy,
} from './governance.js';

export type MembershipPlan = 'free' | 'professional' | 'enterprise';

export type ModelProvider =
  | 'openai'
  | 'claude'
  | 'gemini'
  | 'mistral'
  | 'deepseek'
  | 'grok'
  | 'openrouter'
  | 'groq'
  | 'huggingface'
  | 'together'
  | 'fireworks'
  | 'ollama'
  | 'azure-openai'
  | 'custom'
  | 'ai-pass';

export type RoutingMode =
  | 'balanced'
  | 'best_quality'
  | 'lowest_cost'
  | 'fastest'
  | 'most_private'
  | 'enterprise_safe'
  | 'manual';

export type SupportedTask =
  | 'chat'
  | 'code'
  | 'reasoning'
  | 'agent'
  | 'vision'
  | 'rag'
  | 'summarization'
  | 'fine-tuning';

export interface LegacyModelRecord {
  model_id: string;
  display_name: string;
  description: string;
  provider: ModelProvider;
  provider_model_id?: string;
  model_family: string;
  model_type: string;
  version: string;
  deployment: string;
  availability_status: string;
  max_tokens: number;
  context_window: number;
  supported_tasks: string[];
  input_modalities: string[];
  output_modalities: string[];
  cost_per_1k_tokens: { input: number; output: number };
  credit_cost_multiplier: number;
  plan_required: MembershipPlan;
  enterprise_ready: boolean;
  trust_score: number;
  certification_status: string;
  privacy_level: string;
  compliance_status: string;
  latency_class: string;
  quality_class: string;
  supported_regions: string[];
}

export interface RoutingResult {
  primary: LegacyModelRecord;
  fallbacks: LegacyModelRecord[];
  mode: RoutingMode;
  reason: string;
}

export interface BYOKeyRecord {
  id: string;
  provider: ModelProvider;
  label: string;
  key_preview: string;
  status: 'active' | 'pending' | 'revoked' | 'failed';
  last_test_result?: string;
  created_at: string;
}

export const PROVIDER_LABELS: Record<ModelProvider, string> = {
  openai: 'OpenAI',
  claude: 'Claude',
  gemini: 'Google Gemini',
  mistral: 'Mistral',
  deepseek: 'DeepSeek',
  grok: 'Grok',
  openrouter: 'OpenRouter',
  groq: 'Groq',
  huggingface: 'Hugging Face',
  together: 'Together AI',
  fireworks: 'Fireworks',
  ollama: 'Ollama',
  'azure-openai': 'Azure OpenAI',
  custom: 'Custom',
  'ai-pass': 'AI-Pass',
};

const PLAN_TO_GATE: Record<MembershipPlan, MembershipPlanGate> = {
  free: 'free',
  professional: 'professional',
  enterprise: 'enterprise',
};

const GATE_TO_PLAN: Record<MembershipPlanGate, MembershipPlan> = {
  free: 'free',
  professional: 'professional',
  power: 'professional',
  enterprise: 'enterprise',
};

function mapProvider(record: ModelRecord): ModelProvider {
  if (record.providerId === 'aipass') return 'ai-pass';
  if (record.providerId === 'anthropic') return 'claude';
  if (record.providerId === 'azure') return 'azure-openai';
  const map: Partial<Record<ModelRecord['providerId'], ModelProvider>> = {
    openai: 'openai',
    gemini: 'gemini',
    mistral: 'mistral',
    deepseek: 'deepseek',
    grok: 'grok',
    openrouter: 'openrouter',
    groq: 'groq',
    huggingface: 'huggingface',
    together: 'together',
    fireworks: 'fireworks',
    ollama: 'ollama',
    custom: 'custom',
  };
  return map[record.providerId] ?? 'custom';
}

function latencyClass(ms: number): string {
  if (ms <= 150) return 'ultra_fast';
  if (ms <= 450) return 'fast';
  if (ms <= 900) return 'balanced';
  return 'quality';
}

function qualityClass(record: ModelRecord): string {
  if (record.pricing.tier === 'frontier') return 'frontier';
  if (record.pricing.tier === 'premium') return 'great';
  if (record.pricing.tier === 'standard') return 'good';
  return 'good';
}

export function toLegacyModel(record: ModelRecord): LegacyModelRecord {
  const inputUsd = record.pricing.inputCostPer1M
    ? record.pricing.inputCostPer1M / 1000
    : record.pricing.inputCreditsPer1K * 0.001;
  const outputUsd = record.pricing.outputCostPer1M
    ? record.pricing.outputCostPer1M / 1000
    : record.pricing.outputCreditsPer1K * 0.001;

  return {
    model_id: record.id,
    display_name: record.displayName,
    description: record.description,
    provider: mapProvider(record),
    provider_model_id: record.hubModelId,
    model_family: record.family ?? record.category,
    model_type: record.category,
    version: '1.0',
    deployment: record.isLocal ? 'local' : record.isEnterprise ? 'enterprise' : 'cloud',
    availability_status: record.status,
    max_tokens: record.contextLength,
    context_window: record.contextLength,
    supported_tasks: record.capabilities,
    input_modalities: record.supportsVision ? ['text', 'image'] : ['text'],
    output_modalities: ['text'],
    cost_per_1k_tokens: { input: inputUsd, output: outputUsd },
    credit_cost_multiplier: record.pricing.tier === 'frontier' ? 4 : record.pricing.tier === 'premium' ? 2 : 1,
    plan_required: GATE_TO_PLAN[record.minPlan],
    enterprise_ready: record.isEnterprise || record.certified,
    trust_score: record.trust.trust,
    certification_status: record.certified ? 'certified' : 'uncertified',
    privacy_level: record.isLocal ? 'local' : record.category === 'private' ? 'private' : 'cloud',
    compliance_status: record.certified ? 'compliant' : 'standard',
    latency_class: latencyClass(record.latencyMs),
    quality_class: qualityClass(record),
    supported_regions: record.isLocal ? ['on-prem'] : ['global'],
  };
}

export function getModel(modelId: string): LegacyModelRecord | undefined {
  const record = defaultModelRegistry.get(modelId);
  return record ? toLegacyModel(record) : undefined;
}

export function getModels(filters: import('./types.js').ModelCatalogFilters = {}): ModelRecord[] {
  return defaultModelRegistry.search(filters);
}

export function getModelById(id: string): ModelRecord | undefined {
  return defaultModelRegistry.get(id);
}

export function getModelCount(): number {
  return defaultModelRegistry.count();
}

export const MODEL_REGISTRY_COUNT = MODEL_REGISTRY.length;

export const AIPASS_MODELS = MODEL_REGISTRY.filter((m) => m.category === 'aipass');

export const MODEL_CATEGORIES = [
  { id: 'aipass' as const, label: 'AI-Pass Models', description: 'Proprietary AI-Pass model family' },
  { id: 'provider' as const, label: 'Provider Models', description: 'Third-party cloud APIs' },
  { id: 'open-source' as const, label: 'Open-Source / Local', description: 'Ollama, vLLM, LM Studio' },
  { id: 'private' as const, label: 'Private Models', description: 'Customer-owned endpoints' },
];

export const MODEL_CAPABILITIES = [
  'chat', 'completion', 'reasoning', 'vision', 'embedding', 'code', 'agent', 'multimodal', 'fine-tuned', 'voice', 'tool-calling',
] as const;

export const MODEL_PROVIDERS = [...new Set(MODEL_REGISTRY.map((m) => m.provider))].sort();

export function getFallbackChain(modelId: string): LegacyModelRecord[] {
  const rule = ROUTING_RULES.find(
    (r) => r.defaultModelId === modelId || r.fallbackChain.includes(modelId),
  );
  const chain = rule?.fallbackChain ?? ['gpt-4o-mini', 'gemini-flash', 'claude-haiku'];
  return chain
    .map((id) => defaultModelRegistry.get(id))
    .filter((m): m is ModelRecord => m !== undefined)
    .map(toLegacyModel);
}

export function resolveModelRoute(context: {
  appId?: string;
  workflowId?: string;
  preferredModelId?: string;
  taskType?: string;
}) {
  const resolution = resolveModel({
    appId: context.appId ?? context.workflowId,
    preferredModelId: context.preferredModelId,
    taskType: context.taskType,
  });
  return {
    modelId: resolution.modelId,
    model: resolution.model,
    providerId: resolution.providerId,
    hubModelId: resolution.hubModelId,
    endpoint: resolution.endpoint,
    reason: resolution.reason,
  };
}

export function listRoutingRules() {
  return ROUTING_RULES;
}

export const DEFAULT_ROUTING_RULES = ROUTING_RULES;

export function autoRoute(options: {
  task?: SupportedTask;
  mode?: RoutingMode;
  preferred_model_id?: string;
  membership_plan?: MembershipPlan;
  require_enterprise?: boolean;
  require_private?: boolean;
}): RoutingResult {
  const mode = options.mode ?? 'balanced';
  const plan = PLAN_TO_GATE[options.membership_plan ?? 'free'];

  let candidates = defaultModelRegistry.list().filter((m) => m.status === 'available');

  if (options.require_enterprise) {
    candidates = candidates.filter((m) => m.isEnterprise || m.certified);
  }
  if (options.require_private) {
    candidates = candidates.filter((m) => m.isLocal || m.category === 'private' || m.category === 'open-source');
  }

  if (mode === 'manual' && options.preferred_model_id) {
    const picked = defaultModelRegistry.get(options.preferred_model_id);
    if (picked) {
      return {
        primary: toLegacyModel(picked),
        fallbacks: getFallbackChain(picked.id),
        mode,
        reason: `Manual selection: ${picked.displayName}`,
      };
    }
  }

  const scored = candidates.map((m) => {
    let score = m.trust.trust + m.trust.reliability - m.trust.hallucinationRisk;
    if (mode === 'best_quality') score += (m.benchmarkScore ?? 0) * 2 + (m.pricing.tier === 'frontier' ? 30 : 0);
    if (mode === 'lowest_cost') score -= m.pricing.inputCreditsPer1K * 10 + m.pricing.outputCreditsPer1K * 5;
    if (mode === 'fastest') score -= m.latencyMs * 0.5;
    if (mode === 'enterprise_safe') score += m.certified ? 40 : -20;
    if (options.task === 'code' && m.capabilities.includes('code')) score += 20;
    if (options.task === 'reasoning' && m.capabilities.includes('reasoning')) score += 20;
    if (options.task === 'vision' && m.supportsVision) score += 25;
    if (m.pricing.tier === 'free' && mode === 'lowest_cost') score += 15;
    return { m, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const primary = scored[0]?.m ?? defaultModelRegistry.get('gpt-4o-mini')!;

  const resolution = resolveModel({
    preferredModelId: primary.id,
    membershipTier: plan,
    taskType: options.task,
    autoSelect: mode === 'balanced',
  });

  return {
    primary: toLegacyModel(primary),
    fallbacks: getFallbackChain(primary.id).filter((f) => f.model_id !== primary.id),
    mode,
    reason: resolution.reason,
  };
}

// BYO keys — extended localStorage API for keys page
const BYO_STORAGE = 'ai-pass-byo-keys-v2';

function readByoKeys(): BYOKeyRecord[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BYO_STORAGE);
    return raw ? (JSON.parse(raw) as BYOKeyRecord[]) : [];
  } catch {
    return [];
  }
}

function writeByoKeys(keys: BYOKeyRecord[]) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(BYO_STORAGE, JSON.stringify(keys));
}

export function loadBYOKeys(): BYOKeyRecord[] {
  return readByoKeys();
}

export function addBYOKey(input: { provider: ModelProvider; label: string; api_key: string }): BYOKeyRecord {
  const preview = input.api_key.length > 8
    ? `${input.api_key.slice(0, 4)}••••${input.api_key.slice(-4)}`
    : '••••••••';
  const entry: BYOKeyRecord = {
    id: `key-${Date.now()}`,
    provider: input.provider,
    label: input.label,
    key_preview: preview,
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  const keys = [...readByoKeys(), entry];
  writeByoKeys(keys);
  return entry;
}

export function removeBYOKey(id: string): void {
  writeByoKeys(readByoKeys().filter((k) => k.id !== id));
}

export function revokeBYOKey(id: string): void {
  writeByoKeys(
    readByoKeys().map((k) => (k.id === id ? { ...k, status: 'revoked' as const } : k)),
  );
}

export async function testAndUpdateKey(id: string): Promise<{ ok: boolean; message: string }> {
  const result = await testConnection('openai', 'sk-stub');
  const keys = readByoKeys().map((k) =>
    k.id === id
      ? {
          ...k,
          status: result.ok ? ('active' as const) : ('failed' as const),
          last_test_result: result.ok ? 'ok' : 'failed',
        }
      : k,
  );
  writeByoKeys(keys);
  return result;
}

export async function testConnection(
  _provider: ModelProvider,
  apiKey: string,
  _baseUrl?: string,
): Promise<{ ok: boolean; message: string }> {
  const ok = apiKey.length >= 8;
  return {
    ok,
    message: ok
      ? 'Connection test passed (stub — configure live API in Node deploy)'
      : 'Invalid API key format',
  };
}

export {
  DEFAULT_GOVERNANCE_POLICIES,
  getGovernancePolicy,
  isModelAllowedByPolicy,
};
