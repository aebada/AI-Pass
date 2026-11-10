import type { StreamChunk, ToolCall } from '@ai-pass/shared';
import type { ProviderError } from '../provider-errors.js';
import { formatProviderError, classifyHttpStatus, classifyFetchError } from '../provider-errors.js';

/**
 * OpenAI-format message used by many providers (OpenAI, Mistral, local endpoints).
 */
export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content?: string | null;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
}

/**
 * Tool definition in OpenAI format.
 */
export interface OpenAITool {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters: Record<string, unknown>;
  };
}

/**
 * Normalized configuration for an OpenAI-compatible provider.
 */
export interface OpenAICompatibleConfig {
  provider: string;
  apiKey?: string;
  baseUrl: string;
  model: string;
  timeoutMs: number;
}

/**
 * Internal tool-call buffer used while parsing SSE.
 */
interface ToolCallBuffer {
  id: string;
  type: 'function';
  name: string;
  argsBuilder: string;
}

/**
 * Shared implementation for OpenAI-compatible streaming chat completions.
 *
 * This function:
 * - Converts messages/tools to the provider's expected body.
 * - Calls fetch with a timeout.
 * - Parses SSE and maps to StreamChunk.
 * - Handles errors uniformly via provider-errors.ts.
 */
export async function* streamOpenAICompatibleChat(
  config: OpenAICompatibleConfig,
  messages: OpenAIMessage[],
  tools?: OpenAITool[],
  signal?: AbortSignal,
): AsyncIterableIterator<StreamChunk> {
  const { provider, apiKey, baseUrl, model, timeoutMs } = config;

  const base = baseUrl.replace(/\/+$/, "");
  const url = base.endsWith("/v1")
    ? `${base}/chat/completions`
    : `${base}/v1/chat/completions`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const body = {
    model,
    messages,
    stream: true,
    stream_options: {
      include_usage: true,
    },
    ...(tools && tools.length > 0 ? { tools } : {}),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // If an external signal is provided, forward it.
  if (signal) {
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorText: string | undefined;
      try {
        errorText = await response.text();
      } catch {
        // ignore
      }

      const code = classifyHttpStatus(response.status);
      const message = errorText
        ? `HTTP ${response.status} – ${errorText.slice(0, 180)}`
        : `HTTP ${response.status}`;

      const err: ProviderError = {
        code,
        message,
        provider,
      };

      yield { type: 'error', error: formatProviderError(err) };
      return;
    }

    if (!response.body) {
      const err: ProviderError = {
        code: 'invalid_response',
        message: 'response body is missing',
        provider,
      };
      yield { type: 'error', error: formatProviderError(err) };
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    let buffer = '';
    const toolCalls = new Map<number, ToolCallBuffer>();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line || line.startsWith(':')) continue;
          if (!line.startsWith('data: ')) continue;

          const data = line.slice('data: '.length).trim();
          if (data === '[DONE]') {
            yield { type: 'done' };
            return;
          }

          let parsed: unknown;
          try {
            parsed = JSON.parse(data);
          } catch {
            // Skip malformed lines; some providers emit non-JSON keepalive lines.
            continue;
          }

          const chunk = parsed as {
            id?: string;
            created?: number;
            model?: string;
            choices?: Array<{
              index: number;
              delta?: {
                role?: string;
                content?: string | null;
                tool_calls?: Array<{
                  index?: number;
                  id?: string;
                  type?: 'function';
                  function?: {
                    name?: string;
                    arguments?: string;
                  };
                }>;
              };
              finish_reason?: string | null;
            }>;
            usage?: {
              prompt_tokens?: number;
              completion_tokens?: number;
              total_tokens?: number;
            };
          };

          const choices = chunk.choices ?? [];
          for (const choice of choices) {
            const delta = choice.delta ?? {};

            if (delta.content !== undefined && delta.content !== null) {
              yield { type: 'text', content: delta.content };
            }

            if (delta.tool_calls) {
              for (const tc of delta.tool_calls) {
                const idx = tc.index ?? 0;

                if (tc.id) {
                  toolCalls.set(idx, {
                    id: tc.id,
                    type: tc.type ?? 'function',
                    name: tc.function?.name ?? '',
                    argsBuilder: tc.function?.arguments ?? '',
                  });
                } else {
                  const existing = toolCalls.get(idx);
                  if (existing && tc.function?.arguments) {
                    existing.argsBuilder += tc.function.arguments;
                  }
                }
              }
            }

            if (choice.finish_reason === 'tool_calls') {
              for (const [, tc] of toolCalls.entries()) {
                let parsedArgs: unknown;
                try {
                  parsedArgs = JSON.parse(tc.argsBuilder || '{}');
                } catch {
                  parsedArgs = tc.argsBuilder;
                }

                const toolCall: ToolCall = {
                  id: tc.id,
                  name: tc.name,
                  arguments: typeof parsedArgs === 'object' && parsedArgs !== null
                    ? (parsedArgs as Record<string, unknown>)
                    : { _raw: parsedArgs },
                };

                yield {
                  type: 'tool_call',
                  toolCall,
                };
              }
              toolCalls.clear();
            }
          }

          // We ignore usage for now because StreamChunk has no 'usage' variant.
        }
      }

      // Normal end of stream
      yield { type: 'done' };
    } finally {
      reader.releaseLock();
    }
  } catch (err) {
    clearTimeout(timeoutId);
    const providerError = classifyFetchError(err, provider, {
      url,
      timeoutMs,
    });
    yield { type: 'error', error: formatProviderError(providerError) };
  }
}
