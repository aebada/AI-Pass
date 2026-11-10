import type {
  Message,
  ModelConfig,
  StreamChunk,
  ToolDefinition,
} from '@ai-pass/shared';
import type {
  AIProvider,
  ChatRequest,
  CompletionRequest,
} from '../index.js';
import type { OpenAIMessage, OpenAITool } from './openai-compatible-base.js';
import { streamOpenAICompatibleChat } from './openai-compatible-base.js';
import { createProviderError, formatProviderError } from '../provider-errors.js';

const DEFAULT_TIMEOUT_MS = 60_000;

function toOpenAIMessages(messages: Message[], systemPrompt?: string): OpenAIMessage[] {
  const result: OpenAIMessage[] = [];
  if (systemPrompt) {
    result.push({ role: 'system', content: systemPrompt });
  }
  for (const msg of messages) {
    if (msg.role === 'tool') {
      result.push({
        role: 'tool',
        content: msg.content,
        tool_call_id: msg.toolCallId,
      });
    } else {
      result.push({ role: msg.role, content: msg.content });
    }
  }
  return result;
}

function toOpenAITools(tools?: ToolDefinition[]): OpenAITool[] | undefined {
  if (!tools?.length) return undefined;
  return tools.map((t) => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters as unknown as Record<string, unknown>,
    },
  }));
}

export class LocalProvider implements AIProvider {
  readonly id = 'local';

  async *chat(request: ChatRequest, config: ModelConfig): AsyncIterable<StreamChunk> {
    const baseUrl = config.baseUrl;

    if (!baseUrl) {
      const err = createProviderError(
        'configuration_error',
        'baseUrl is not configured for local provider',
        this.id,
      );
      yield { type: 'error', error: formatProviderError(err) };
      return;
    }

    const openaiMessages = toOpenAIMessages(request.messages, request.systemPrompt);
    const openaiTools = toOpenAITools(request.tools);

    const openaiConfig = {
      provider: this.id,
      apiKey: config.apiKey,
      baseUrl,
      model: config.model,
      timeoutMs: DEFAULT_TIMEOUT_MS,
    };

    yield* streamOpenAICompatibleChat(openaiConfig, openaiMessages, openaiTools);
  }

  async *complete(request: CompletionRequest, config: ModelConfig): AsyncIterable<StreamChunk> {
    const baseUrl = config.baseUrl;

    if (!baseUrl) {
      const err = createProviderError(
        'configuration_error',
        'baseUrl is not configured for local provider',
        this.id,
      );
      yield { type: 'error', error: formatProviderError(err) };
      return;
    }

    const systemPrompt =
      'You are a code completion assistant. Return only the completion text, no explanation.';

    const userContent =
      `Complete this ${request.language ?? 'code'} snippet:\n\n${request.prefix}` +
      (request.suffix ? `\n\nAfter cursor:\n${request.suffix}` : '');

    const openaiMessages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ];

    const openaiConfig = {
      provider: this.id,
      apiKey: config.apiKey,
      baseUrl,
      model: config.model,
      timeoutMs: DEFAULT_TIMEOUT_MS,
    };

    yield* streamOpenAICompatibleChat(openaiConfig, openaiMessages, undefined);
  }
}
