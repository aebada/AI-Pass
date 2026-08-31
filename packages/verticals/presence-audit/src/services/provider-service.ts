import type { AIProvider } from '@ai-pass/shared';

export const AUDIT_PROVIDERS: AIProvider[] = ['openai', 'anthropic', 'google', 'perplexity'];

export const PROVIDER_LABELS: Record<AIProvider, string> = {
  openai: 'ChatGPT',
  anthropic: 'Claude',
  google: 'Gemini',
  perplexity: 'Perplexity',
};

export class ProviderService {
  list(): Array<{ id: AIProvider; label: string; status: 'available' | 'degraded' }> {
    return AUDIT_PROVIDERS.map((id) => ({
      id,
      label: PROVIDER_LABELS[id],
      status: 'available' as const,
    }));
  }

  resolveForTier(allowedCount: number): AIProvider[] {
    return AUDIT_PROVIDERS.slice(0, Math.max(1, allowedCount));
  }
}
