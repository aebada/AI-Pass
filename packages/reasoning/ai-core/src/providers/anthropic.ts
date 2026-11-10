import type { ModelConfig, StreamChunk } from '@ai-pass/shared';
import type { AIProvider, ChatRequest, CompletionRequest } from '../index.js';

export class AnthropicProvider implements AIProvider {
  readonly id = 'anthropic';

  async *chat(request: ChatRequest, config: ModelConfig): AsyncIterable<StreamChunk> {
    const baseUrl = config.baseUrl ?? 'https://api.anthropic.com/v1';
    const systemPrompt = request.systemPrompt ?? '';

    const response = await fetch(`${baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: config.maxTokens ?? 4096,
        system: systemPrompt,
        messages: request.messages
          .filter((m) => m.role !== 'system' && m.role !== 'tool')
          .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
        stream: true,
        temperature: config.temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      yield { type: 'error', error: `Anthropic API error: ${response.status} ${err}` };
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
        if (!line.startsWith('data: ')) continue;
        try {
          const event = JSON.parse(line.slice(6));
          if (event.type === 'content_block_delta' && event.delta?.text) {
            yield { type: 'text', content: event.delta.text };
          }
          if (event.type === 'message_stop') {
            yield { type: 'done' };
            return;
          }
        } catch {
          // skip
        }
      }
    }
    yield { type: 'done' };
  }

  async *complete(request: CompletionRequest, config: ModelConfig): AsyncIterable<StreamChunk> {
    yield* this.chat(
      {
        messages: [
          {
            id: '1',
            role: 'user',
            content: `Complete this ${request.language ?? 'code'}:\n${request.prefix}`,
            createdAt: Date.now(),
          },
        ],
        systemPrompt: 'Return only code completion, no explanation.',
      },
      { ...config, maxTokens: request.maxTokens ?? 256 }
    );
  }
}
