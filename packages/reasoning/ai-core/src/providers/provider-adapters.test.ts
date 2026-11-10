import { describe, expect, it } from 'vitest';
import type { ModelConfig } from '@ai-pass/shared';
import { MistralProvider } from './mistral.js';
import { LocalProvider } from './local.js';

function chunkArray<T>(iter: AsyncIterable<T>): Promise<T[]> {
  const result: T[] = [];
  return (async () => {
    for await (const chunk of iter) {
      result.push(chunk);
    }
    return result;
  })();
}

describe('MistralProvider', () => {
  it('yields configuration_error when apiKey is missing', async () => {
    const provider = new MistralProvider();
    const config: ModelConfig = {
      provider: 'mistral',
      model: 'mistral-small-latest',
      // no apiKey
    };

    const chunks = await chunkArray(
      provider.chat(
        {
          messages: [
            { id: '1', role: 'user', content: 'Hello', createdAt: Date.now() },
          ],
        },
        config,
      ),
    );

    expect(chunks).toHaveLength(1);
    expect(chunks[0].type).toBe('error');
    expect(chunks[0].error).toContain('configuration_error');
    expect(chunks[0].error).toContain('mistral');
  });
});

describe('LocalProvider', () => {
  it('yields configuration_error when baseUrl is missing', async () => {
    const provider = new LocalProvider();
    const config: ModelConfig = {
      provider: 'local',
      model: 'llama3.1:8b',
      // no baseUrl
    };

    const chunks = await chunkArray(
      provider.chat(
        {
          messages: [
            { id: '1', role: 'user', content: 'Hello', createdAt: Date.now() },
          ],
        },
        config,
      ),
    );

    expect(chunks).toHaveLength(1);
    expect(chunks[0].type).toBe('error');
    expect(chunks[0].error).toContain('configuration_error');
    expect(chunks[0].error).toContain('local');
  });
});
