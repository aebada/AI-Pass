import type { Message, ModelConfig, StreamChunk, ToolDefinition } from '@ai-pass/shared';
import type { AIProvider, ChatRequest, CompletionRequest } from '../index.js';

function toOpenAIMessages(messages: Message[], systemPrompt?: string) {
  const result: Array<{ role: string; content: string; tool_call_id?: string }> = [];
  if (systemPrompt) {
    result.push({ role: 'system', content: systemPrompt });
  }
  for (const msg of messages) {
    if (msg.role === 'tool') {
      result.push({ role: 'tool', content: msg.content, tool_call_id: msg.toolCallId });
    } else {
      result.push({ role: msg.role, content: msg.content });
    }
  }
  return result;
}

function toOpenAITools(tools?: ToolDefinition[]) {
  if (!tools?.length) return undefined;
  return tools.map((t) => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));
}

export class OpenAIProvider implements AIProvider {
  readonly id: string = 'openai';

  async *chat(request: ChatRequest, config: ModelConfig): AsyncIterable<StreamChunk> {
    const baseUrl = config.baseUrl ?? 'https://api.openai.com/v1';
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey ?? ''}`,
        ...(config.extraHeaders ?? {}),
      },
      body: JSON.stringify({
        model: config.model,
        messages: toOpenAIMessages(request.messages, request.systemPrompt),
        tools: toOpenAITools(request.tools),
        stream: true,
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      yield { type: 'error', error: `OpenAI API error: ${response.status} ${err}` };
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      yield { type: 'error', error: 'No response body' };
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') {
            yield { type: 'done' };
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta;
            if (delta?.content) {
              yield { type: 'text', content: delta.content };
            }
            if (delta?.tool_calls?.[0]) {
              const tc = delta.tool_calls[0];
              yield {
                type: 'tool_call',
                toolCall: {
                  id: tc.id ?? '',
                  name: tc.function?.name ?? '',
                  arguments: tc.function?.arguments ? JSON.parse(tc.function.arguments) : {},
                },
              };
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
      yield { type: 'done' };
    } finally {
      reader.releaseLock();
    }
  }

  async *complete(request: CompletionRequest, config: ModelConfig): AsyncIterable<StreamChunk> {
    const baseUrl = config.baseUrl ?? 'https://api.openai.com/v1';
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey ?? ''}`,
        ...(config.extraHeaders ?? {}),
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: 'You are a code completion assistant. Return only the completion text, no explanation.',
          },
          {
            role: 'user',
            content: `Complete this ${request.language ?? 'code'} snippet:\n\n${request.prefix}${request.suffix ? `\n\nAfter cursor:\n${request.suffix}` : ''}`,
          },
        ],
        stream: true,
        temperature: config.temperature ?? 0.2,
        max_tokens: request.maxTokens ?? config.maxTokens ?? 256,
      }),
    });

    if (!response.ok) {
      yield { type: 'error', error: `OpenAI API error: ${response.status}` };
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') {
          yield { type: 'done' };
          return;
        }
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) yield { type: 'text', content };
        } catch {
          // skip
        }
      }
    }
    yield { type: 'done' };
  }
}
