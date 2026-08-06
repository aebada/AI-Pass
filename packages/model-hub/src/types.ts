/** Provider identifiers — mirrors provider-hub for standalone use */
export type HubProviderId =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'openrouter'
  | 'deepseek'
  | 'grok'
  | 'mistral'
  | 'llama'
  | 'qwen'
  | 'cerebras'
  | 'sambanova'
  | 'ollama'
  | 'huggingface'
  | 'together'
  | 'groq'
  | 'fireworks'
  | 'kimi';

export type ModelProviderId = HubProviderId | 'aipass' | 'azure' | 'bedrock' | 'vertex' | 'custom';

export type ModelCategory = 'aipass' | 'provider' | 'open-source' | 'private';

export type AIPassFamily =
  | 'general'
  | 'enterprise'
  | 'finance'
  | 'supply'
  | 'hr'
  | 'legal'
  | 'analyst'
  | 'compliance'
  | 'support';

export type ModelCapability =
  | 'chat'
  | 'completion'
  | 'reasoning'
  | 'vision'
  | 'embedding'
  | 'code'
  | 'agent'
  | 'multimodal'
  | 'fine-tuned'
  | 'voice'
  | 'tool-calling';

export type ModelStatus = 'available' | 'beta' | 'deprecated' | 'unavailable';

export type ModelPricingTier = 'free' | 'standard' | 'premium' | 'frontier';

export type MembershipPlanGate = 'free' | 'professional' | 'power' | 'enterprise';

export interface ModelPricing {
  inputCreditsPer1K: number;
  outputCreditsPer1K: number;
  inputCostPer1M?: number;
  outputCostPer1M?: number;
  tier: ModelPricingTier;
}

export interface ModelTrustScores {
  trust: number;
  reliability: number;
  hallucinationRisk: number;
}

/** Full ModelRecord schema — canonical catalog entry */
export interface ModelRecord {
  id: string;
  name: string;
  displayName: string;
  provider: string;
  providerId: ModelProviderId;
  category: ModelCategory;
  family?: AIPassFamily;
  description: string;
  purpose?: string;
  capabilities: ModelCapability[];
  pricing: ModelPricing;
  status: ModelStatus;
  useCases: string[];
  contextLength: number;
  tags: string[];
  hubModelId?: string;
  endpoint?: string;
  certified: boolean;
  isEnterprise: boolean;
  isLocal: boolean;
  isOpenSource: boolean;
  supportsVision: boolean;
  supportsVoice: boolean;
  supportsToolCalling: boolean;
  latencyMs: number;
  minPlan: MembershipPlanGate;
  trust: ModelTrustScores;
  benchmarkScore?: number;
}

export interface ModelCatalogFilters {
  category?: ModelCategory;
  provider?: string;
  providerId?: ModelProviderId;
  capability?: ModelCapability;
  status?: ModelStatus;
  query?: string;
  tier?: ModelPricingTier;
  useCase?: string;
  freeOnly?: boolean;
  paidOnly?: boolean;
  enterprise?: boolean;
  local?: boolean;
  openSource?: boolean;
  certified?: boolean;
  minContext?: number;
  vision?: boolean;
  voice?: boolean;
  toolCalling?: boolean;
  family?: AIPassFamily;
}

export interface RoutingRule {
  id: string;
  appId: string;
  appName: string;
  defaultModelId: string;
  fallbackChain: string[];
  description?: string;
}

export interface RoutingContext {
  appId?: string;
  workflowId?: string;
  taskType?: string;
  preferredModelId?: string;
  membershipTier?: MembershipPlanGate;
  autoSelect?: boolean;
}

export interface ModelRouteResolution {
  modelId: string;
  model: ModelRecord;
  providerId: string;
  hubModelId: string;
  endpoint?: string;
  reason: string;
  fallbackChain: string[];
  estimatedCredits: number;
}

export interface GovernancePolicy {
  id: string;
  name: string;
  description: string;
  allowedCategories: ModelCategory[];
  blockedModelIds: string[];
  allowedModelIds?: string[];
  requireApproval: boolean;
  maxTier: ModelPricingTier;
}

export interface ModelComparisonResult {
  models: ModelRecord[];
  dimensions: ComparisonDimension[];
  winner?: string;
  summary: string;
}

export interface ComparisonDimension {
  key: string;
  label: string;
  values: Record<string, string | number>;
}

export interface FineTuneProject {
  id: string;
  name: string;
  baseModelId: string;
  status: 'draft' | 'training' | 'ready' | 'failed';
  datasetName?: string;
  createdAt: string;
}

export interface ProviderConnection {
  providerId: ModelProviderId;
  connected: boolean;
  authMode: 'managed' | 'byok' | 'hybrid';
  lastVerified?: string;
}

export interface ModelUsageRecord {
  modelId: string;
  requests: number;
  creditsUsed: number;
  avgLatencyMs: number;
  period: string;
}
