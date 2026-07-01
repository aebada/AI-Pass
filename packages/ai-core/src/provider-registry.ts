import type { ModelConfig } from '@ai-pass/shared';
import type { AIProvider } from './index.js';
import { OpenAIProvider } from './providers/openai.js';
import { AnthropicProvider } from './providers/anthropic.js';
import { OpenAICompatibleProvider } from './providers/openai-compatible.js';

const providers = new Map<string, () => AIProvider>([
  ['openai', () => new OpenAIProvider()],
  ['anthropic', () => new AnthropicProvider()],
  ['openai-compatible', () => new OpenAICompatibleProvider()],
]);

export function createProvider(config: ModelConfig): AIProvider {
  const factory = providers.get(config.provider);
  if (!factory) {
    throw new Error(`Unknown provider: ${config.provider}`);
  }
  return factory();
}

export function getProvider(id: string): AIProvider | undefined {
  const factory = providers.get(id);
  return factory?.();
}

export function registerProvider(id: string, factory: () => AIProvider): void {
  providers.set(id, factory);
}
