import type { CompletionRequest } from '@ai-pass/ai-core';
import { buildSystemPrompt, createProvider } from '@ai-pass/ai-core';
import type { ModelConfig, StreamChunk } from '@ai-pass/shared';
import { defaultMembershipService } from '@ai-pass/membership';
import { defaultWalletService } from '@ai-pass/wallet';
import type { MembershipService } from '@ai-pass/membership';
import type { WalletService } from '@ai-pass/wallet';
import {
  defaultModelCatalog,
  defaultProviderRegistry,
  type ModelCatalog,
  type ProviderRegistry,
} from './catalog.js';
import { defaultHealthMonitor, type HealthMonitor } from './health-monitor.js';
import { defaultRoutingEngine, type RoutingEngine } from './routing-engine.js';
import type {
  AuthConfig,
  HubChatRequest,
  HubExecuteRequest,
  HubExecuteResponse,
  HubRequestContext,
  ProviderHubOptions,
  TaskType,
} from './types.js';

export class ProviderHub {
  readonly catalog: ModelCatalog;
  readonly registry: ProviderRegistry;
  readonly routing: RoutingEngine;
  readonly health: HealthMonitor;

  private membership: MembershipService;
  private wallet: WalletService;
  private auth: AuthConfig;

  constructor(options: ProviderHubOptions = {}) {
    this.catalog = defaultModelCatalog;
    this.registry = defaultProviderRegistry;
    this.routing = defaultRoutingEngine;
    this.health = defaultHealthMonitor;
    this.membership = options.membershipService ?? defaultMembershipService;
    this.wallet = options.walletService ?? defaultWalletService;
    this.auth = options.auth ?? { mode: 'managed' };
  }

  async *streamChat(
    request: HubChatRequest,
    context: HubRequestContext,
  ): AsyncIterable<StreamChunk> {
    const check = this.membership.checkRequest(context.userId, context.membershipTier);
    if (!check.allowed) {
      yield { type: 'error', error: check.reason ?? 'Membership limit reached' };
      return;
    }

    const walletBalance = this.wallet.getBalance(context.userId);
    if (walletBalance.creditsRemaining <= 0) {
      yield { type: 'error', error: 'Monthly credits exhausted. Upgrade or wait for renewal.' };
      return;
    }

    const decision = this.routing.select({
      taskType: context.taskType ?? 'chat',
      membershipTier: context.membershipTier,
      preferredModelId: request.modelId ?? context.preferredModelId,
      orgId: context.orgId,
    });

    if (!this.membership.canAccessModel(context.membershipTier, decision.model.id, decision.model.tier, decision.model.providerId)) {
      yield {
        type: 'error',
        error: `Model "${decision.model.displayName}" requires a higher membership tier. Upgrade to unlock.`,
      };
      return;
    }

    const health = this.health.check(decision.model.providerId);
    let activeModel = decision.model;
    if (health.status === 'down' && decision.fallbackModelIds.length > 0) {
      const fallback = this.catalog.get(decision.fallbackModelIds[0]);
      if (fallback) activeModel = fallback;
    }

    const config = this.resolveModelConfig(activeModel);
    if (!config.apiKey) {
      yield {
        type: 'error',
        error: `Provider "${activeModel.providerName}" is not configured. Add API keys to .env.local.`,
      };
      return;
    }
    const provider = createProvider(config);

    let outputChars = 0;
    for await (const chunk of provider.chat(
      {
        messages: request.messages,
        tools: request.tools,
        systemPrompt: request.systemPrompt,
      },
      { ...config, temperature: request.temperature, maxTokens: request.maxTokens },
    )) {
      if (chunk.type === 'text' && chunk.content) outputChars += chunk.content.length;
      yield chunk;
    }

    const credits = this.estimateCredits(activeModel, outputChars);
    this.membership.recordRequest(context.userId, credits);
    this.wallet.recordUsage({
      userId: context.userId,
      tenantId: context.tenantId,
      provider: activeModel.providerName,
      model: activeModel.model,
      credits,
      estimatedCostUsd: credits * 0.01,
      taskType: context.taskType,
      module: context.module,
    });
  }

  async *complete(
    request: CompletionRequest,
    context: HubRequestContext,
    modelId?: string,
  ): AsyncIterable<StreamChunk> {
    const check = this.membership.checkRequest(context.userId, context.membershipTier);
    if (!check.allowed) {
      yield { type: 'error', error: check.reason ?? 'Membership limit reached' };
      return;
    }

    const decision = this.routing.select({
      taskType: 'completion',
      membershipTier: context.membershipTier,
      preferredModelId: modelId ?? context.preferredModelId,
      preferSpeed: true,
      orgId: context.orgId,
    });

    const config = this.resolveModelConfig(decision.model);
    const provider = createProvider(config);

    let outputChars = 0;
    for await (const chunk of provider.complete(request, config)) {
      if (chunk.type === 'text' && chunk.content) outputChars += chunk.content.length;
      yield chunk;
    }

    const credits = this.estimateCredits(decision.model, outputChars, 0.5);
    this.membership.recordRequest(context.userId, credits);
    this.wallet.recordUsage({
      userId: context.userId,
      provider: decision.model.providerName,
      model: decision.model.model,
      credits,
      estimatedCostUsd: credits * 0.01,
      taskType: 'completion',
      module: context.module,
    });
  }

  async executeRequest(request: HubExecuteRequest): Promise<HubExecuteResponse> {
    let content = '';
    for await (const chunk of this.streamChat(request, request.context)) {
      if (chunk.type === 'text' && chunk.content) content += chunk.content;
      if (chunk.type === 'error') throw new Error(chunk.error ?? 'Request failed');
    }

    const modelId =
      request.modelId ??
      request.context.preferredModelId ??
      this.routing.select({
        taskType: request.context.taskType ?? 'chat',
        membershipTier: request.context.membershipTier,
      }).model.id;

    const model = this.catalog.get(modelId)!;
    const credits = this.estimateCredits(model, content.length);
    const usage = this.wallet.getRecentUsage(request.context.userId, 1)[0];

    return {
      content,
      modelId: model.id,
      providerId: model.providerId,
      credits,
      estimatedCostUsd: credits * 0.01,
      usageRecordId: usage?.id ?? 'unknown',
    };
  }

  resolveModelConfig(model: import('./types.js').ModelCatalogEntry): ModelConfig {
    const providerDef = this.registry.get(model.providerId)!;
    const apiKey = this.resolveApiKey(model.providerId);

    return {
      provider: providerDef.backendProvider,
      model: model.model,
      apiKey,
      baseUrl: providerDef.defaultBaseUrl,
      extraHeaders: providerDef.defaultHeaders,
      temperature: 0.7,
      maxTokens: 4096,
    };
  }

  /** Check whether a provider has a configured API key */
  isProviderConfigured(providerId: import('./types.js').HubProviderId): boolean {
    return Boolean(this.resolveApiKey(providerId));
  }

  private resolveApiKey(providerId: import('./types.js').HubProviderId): string | undefined {
    if (this.auth.mode === 'managed') {
      return this.auth.managedKeys?.[providerId];
    }
    if (this.auth.mode === 'byok') {
      return this.auth.byokKeys?.[providerId];
    }
    return this.auth.byokKeys?.[providerId] ?? this.auth.managedKeys?.[providerId];
  }

  private estimateCredits(
    model: import('./types.js').ModelCatalogEntry,
    outputChars: number,
    multiplier = 1,
  ): number {
    const base = Math.max(1, Math.ceil(outputChars / 100));
    const tierMultiplier = { free: 0.5, standard: 1, premium: 2, frontier: 4 };
    return Math.ceil(base * tierMultiplier[model.tier] * multiplier);
  }
}

/** Create hub from legacy ModelConfig for backward compatibility */
export function createProviderHubFromConfig(
  config: ModelConfig,
  _context: Partial<HubRequestContext> = {},
): ProviderHub {
  return new ProviderHub({
    auth: {
      mode: config.apiKey ? 'byok' : 'managed',
      byokKeys: config.apiKey ? { openai: config.apiKey, anthropic: config.apiKey } : undefined,
    },
  });
}

export function createProviderHub(options?: ProviderHubOptions): ProviderHub {
  return new ProviderHub(options);
}

export function createHubContext(
  userId: string,
  membershipTier: import('@ai-pass/shared').MembershipTier,
  overrides: Partial<HubRequestContext> = {},
): HubRequestContext {
  return {
    userId,
    membershipTier,
    taskType: 'chat' as TaskType,
    ...overrides,
  };
}

export { buildSystemPrompt };
