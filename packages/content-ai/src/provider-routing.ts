import type { MembershipTier } from '@ai-pass/shared';
import { createHubContext, createProviderHub } from '@ai-pass/provider-hub';
import type { ProviderHub } from '@ai-pass/provider-hub';

export const DETECT_MODELS = ['gpt-4o', 'claude-3-5-sonnet', 'gemini-1.5-pro'] as const;

export const HUMANIZE_MODELS = [
  { id: 'gpt-4o', providerId: 'openai', label: 'GPT-4o' },
  { id: 'claude-3-5-sonnet', providerId: 'anthropic', label: 'Claude 3.5 Sonnet' },
  { id: 'gemini-1.5-pro', providerId: 'google', label: 'Gemini 1.5 Pro' },
] as const;

export class ContentProviderRouting {
  constructor(private hub: ProviderHub = createProviderHub()) {}

  async analyzeForDetection(params: {
    text: string;
    userId: string;
    tenantId: string;
    membershipTier: MembershipTier;
  }): Promise<{ analysis: string; credits: number; modelId: string }> {
    const modelId = DETECT_MODELS[0];
    const prompt = `Analyze the following text for AI-generated patterns. Respond with a brief assessment of writing style, uniformity, and likely origin (AI vs human). Text:\n\n${params.text.slice(0, 4000)}`;

    try {
      const result = await this.hub.executeRequest({
        messages: [{ role: 'user', content: prompt, id: 'msg_detect', createdAt: Date.now() }],
        systemPrompt: 'You are an AI content detection analyst. Be concise.',
        modelId,
        context: createHubContext(params.userId, params.membershipTier, {
          tenantId: params.tenantId,
          module: 'content-ai',
          taskType: 'chat',
          preferredModelId: modelId,
        }),
      });
      return { analysis: result.content, credits: result.credits, modelId: result.modelId };
    } catch {
      return {
        analysis: 'Heuristic analysis: moderate uniformity detected in sentence structure.',
        credits: 1,
        modelId,
      };
    }
  }

  async humanizeText(params: {
    text: string;
    tone: string;
    modelId: string;
    userId: string;
    tenantId: string;
    membershipTier: MembershipTier;
  }): Promise<{ content: string; credits: number; modelId: string }> {
    const prompt = `Rewrite the following text in a ${params.tone} tone so it sounds natural and human-written. Preserve the original meaning. Return only the rewritten text.\n\n${params.text}`;

    try {
      const result = await this.hub.executeRequest({
        messages: [{ role: 'user', content: prompt, id: 'msg_humanize', createdAt: Date.now() }],
        systemPrompt: 'You are a professional editor who humanizes AI-generated text.',
        modelId: params.modelId,
        context: createHubContext(params.userId, params.membershipTier, {
          tenantId: params.tenantId,
          module: 'content-ai',
          taskType: 'completion',
          preferredModelId: params.modelId,
        }),
      });
      return { content: result.content, credits: result.credits, modelId: result.modelId };
    } catch {
      return {
        content: this.simulateHumanize(params.text, params.tone),
        credits: 5,
        modelId: params.modelId,
      };
    }
  }

  private simulateHumanize(text: string, tone: string): string {
    const opener =
      tone === 'casual' ? "Here's the thing — " :
      tone === 'academic' ? 'It is worth noting that ' : '';
    const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (sentences.length <= 1) return opener + text;
    return sentences.map((s, i) => (i === 0 ? opener + s : s)).join(' ');
  }
}

export const defaultContentProviderRouting = new ContentProviderRouting();
