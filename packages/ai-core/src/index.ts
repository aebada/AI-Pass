import type { Message, ModelConfig, StreamChunk, ToolDefinition } from '@ai-pass/shared';

export interface ChatRequest {
  messages: Message[];
  tools?: ToolDefinition[];
  systemPrompt?: string;
}

export interface CompletionRequest {
  prefix: string;
  suffix?: string;
  language?: string;
  maxTokens?: number;
}

export interface AIProvider {
  readonly id: string;
  chat(request: ChatRequest, config: ModelConfig): AsyncIterable<StreamChunk>;
  complete(request: CompletionRequest, config: ModelConfig): AsyncIterable<StreamChunk>;
}

export interface ProviderFactory {
  create(config: ModelConfig): AIProvider;
}

export { OpenAIProvider } from './providers/openai.js';
export { AnthropicProvider } from './providers/anthropic.js';
export { OpenAICompatibleProvider } from './providers/openai-compatible.js';
export { createProvider, getProvider } from './provider-registry.js';
export { buildSystemPrompt } from './prompt-builder.js';
