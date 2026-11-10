import { OpenAIProvider } from './openai.js';

export class OpenAICompatibleProvider extends OpenAIProvider {
  readonly id = 'openai-compatible';

  constructor(private defaultBaseUrl = 'http://localhost:11434/v1') {
    super();
  }

  override async *chat(
    request: Parameters<OpenAIProvider['chat']>[0],
    config: Parameters<OpenAIProvider['chat']>[1]
  ) {
    const merged = {
      ...config,
      baseUrl: config.baseUrl ?? this.defaultBaseUrl,
    };
    yield* super.chat(request, merged);
  }

  override async *complete(
    request: Parameters<OpenAIProvider['complete']>[0],
    config: Parameters<OpenAIProvider['complete']>[1]
  ) {
    const merged = {
      ...config,
      baseUrl: config.baseUrl ?? this.defaultBaseUrl,
    };
    yield* super.complete(request, merged);
  }
}
