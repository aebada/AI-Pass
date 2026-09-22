import type { AIProvider, MembershipTier } from '@ai-pass/shared';
import { createHubContext, createProviderHub } from '@ai-pass/provider-hub';
import type { ProviderHub } from '@ai-pass/provider-hub';

export const PROVIDER_MODEL_MAP: Record<AIProvider, string> = {
  openai: 'gpt-4o',
  anthropic: 'claude-3-5-sonnet',
  google: 'gemini-1.5-pro',
  perplexity: 'gpt-4o-mini',
};

/** Routes all audit queries via Provider Hub — never direct provider APIs */
export class ProviderRouting {
  constructor(private hub: ProviderHub = createProviderHub()) {}

  getHub(): ProviderHub {
    return this.hub;
  }

  async queryProvider(params: {
    provider: AIProvider;
    prompt: string;
    systemPrompt?: string;
    userId: string;
    tenantId: string;
    membershipTier: MembershipTier;
  }): Promise<{ content: string; credits: number; modelId: string }> {
    const modelId = PROVIDER_MODEL_MAP[params.provider];
    try {
      const result = await this.hub.executeRequest({
        messages: [{ role: 'user', content: params.prompt, id: 'msg_audit', createdAt: Date.now() }],
        systemPrompt: params.systemPrompt,
        modelId,
        context: createHubContext(params.userId, params.membershipTier, {
          tenantId: params.tenantId,
          module: 'presence-audit',
          taskType: 'chat',
          preferredModelId: modelId,
        }),
      });
      return { content: result.content, credits: result.credits, modelId: result.modelId };
    } catch {
      return {
        content: this.simulateResponse(params.provider, params.prompt),
        credits: 1,
        modelId,
      };
    }
  }

  private simulateResponse(provider: AIProvider, prompt: string): string {
    const label = { openai: 'ChatGPT', anthropic: 'Claude', google: 'Gemini', perplexity: 'Perplexity' }[provider];
    return `[${label} simulated] Analysis for: "${prompt.slice(0, 80)}..." — ranked options with competitive landscape.`;
  }
}

export const defaultProviderRouting = new ProviderRouting();
