import type { Message, ModelConfig, StreamChunk, ToolDefinition } from '@ai-pass/shared';
import type { MembershipTier } from '@ai-pass/shared';

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
  | 'fireworks';

export type AuthMode = 'managed' | 'byok' | 'hybrid';

export type ModelSpeed = 'fast' | 'balanced' | 'quality';
export type ModelQuality = 'good' | 'great' | 'frontier';
export type ModelTier = 'free' | 'standard' | 'premium' | 'frontier';
export type ModelAvailability = 'available' | 'degraded' | 'unavailable';

export type TaskType =
  | 'chat'
  | 'completion'
  | 'agent'
  | 'code'
  | 'reasoning'
  | 'vision'
  | 'embedding'
  | 'benchmark';

export interface ModelCatalogEntry {
  id: string;
  providerId: HubProviderId;
  providerName: string;
  model: string;
  displayName: string;
  description: string;
  speed: ModelSpeed;
  quality: ModelQuality;
  tier: ModelTier;
  contextLength: number;
  inputCostPer1M: number;
  outputCostPer1M: number;
  availability: ModelAvailability;
  bestUseCases: string[];
  tags: string[];
}

export interface ProviderDefinition {
  id: HubProviderId;
  name: string;
  description: string;
  authModes: AuthMode[];
  website: string;
  supportsStreaming: boolean;
  supportsTools: boolean;
  /** Maps to ai-core provider backend */
  backendProvider: ModelConfig['provider'];
  defaultBaseUrl?: string;
  /** Extra HTTP headers for provider API calls (e.g. OpenRouter attribution). */
  defaultHeaders?: Record<string, string>;
}

export interface CatalogSearchFilters {
  providerId?: HubProviderId;
  tier?: ModelTier;
  speed?: ModelSpeed;
  quality?: ModelQuality;
  availability?: ModelAvailability;
  taskType?: TaskType;
  query?: string;
}

export interface RoutingCriteria {
  taskType: TaskType;
  membershipTier: MembershipTier;
  preferSpeed?: boolean;
  preferQuality?: boolean;
  preferCost?: boolean;
  /** Prefer lower-latency / on-prem capable providers (e.g. Ollama). */
  preferPrivacy?: boolean;
  /** Prefer enterprise-tier models with stronger compliance posture. */
  preferCompliance?: boolean;
  /** Prefer reasoning-optimized models. */
  preferReasoning?: boolean;
  /** Prefer larger context windows. */
  preferContext?: boolean;
  /** Prefer local / air-gapped capable backends. */
  preferLocal?: boolean;
  maxLatencyMs?: number;
  preferredModelId?: string;
  orgId?: string;
}

export interface RoutingDecision {
  model: ModelCatalogEntry;
  provider: ProviderDefinition;
  reason: string;
  fallbackModelIds: string[];
}

export interface ProviderHealth {
  providerId: HubProviderId;
  status: 'healthy' | 'degraded' | 'down';
  latencyMs: number;
  errorRate: number;
  lastChecked: string;
}

export interface AuthConfig {
  mode: AuthMode;
  managedKeys?: Partial<Record<HubProviderId, string>>;
  byokKeys?: Partial<Record<HubProviderId, string>>;
}

export interface HubRequestContext {
  userId: string;
  tenantId?: string;
  orgId?: string;
  membershipTier: MembershipTier;
  taskType?: TaskType;
  module?: string;
  preferredModelId?: string;
}

export interface HubChatRequest {
  messages: Message[];
  tools?: ToolDefinition[];
  systemPrompt?: string;
  modelId?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface HubExecuteRequest extends HubChatRequest {
  context: HubRequestContext;
}

export interface HubExecuteResponse {
  content: string;
  modelId: string;
  providerId: HubProviderId;
  credits: number;
  estimatedCostUsd: number;
  usageRecordId: string;
}

export interface ProviderHubOptions {
  membershipService?: import('@ai-pass/membership').MembershipService;
  walletService?: import('@ai-pass/wallet').WalletService;
  auth?: AuthConfig;
}

export type { Message, ModelConfig, StreamChunk, ToolDefinition };
