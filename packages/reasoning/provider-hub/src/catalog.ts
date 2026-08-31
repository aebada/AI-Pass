import type { ModelCatalogEntry, ProviderDefinition, HubProviderId } from './types.js';

export const PROVIDER_DEFINITIONS: ProviderDefinition[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-5, GPT-4o, and embedding models',
    authModes: ['managed', 'byok', 'hybrid'],
    website: 'https://openai.com',
    supportsStreaming: true,
    supportsTools: true,
    backendProvider: 'openai',
  },
  {
    id: 'anthropic',
    name: 'Claude',
    description: 'Claude Sonnet, Opus, and Haiku models',
    authModes: ['managed', 'byok', 'hybrid'],
    website: 'https://anthropic.com',
    supportsStreaming: true,
    supportsTools: true,
    backendProvider: 'anthropic',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Gemini Pro, Flash, and multimodal models',
    authModes: ['managed', 'byok', 'hybrid'],
    website: 'https://ai.google.dev',
    supportsStreaming: true,
    supportsTools: true,
    backendProvider: 'openai-compatible',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Unified API for 100+ models',
    authModes: ['managed', 'byok', 'hybrid'],
    website: 'https://openrouter.ai',
    supportsStreaming: true,
    supportsTools: true,
    backendProvider: 'openai-compatible',
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'https://ai-pass.app',
      'X-Title': 'AI Pass',
    },
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'DeepSeek V3 and R1 reasoning models',
    authModes: ['managed', 'byok', 'hybrid'],
    website: 'https://deepseek.com',
    supportsStreaming: true,
    supportsTools: true,
    backendProvider: 'openai-compatible',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
  },
  {
    id: 'grok',
    name: 'Grok',
    description: 'xAI Grok models',
    authModes: ['managed', 'byok'],
    website: 'https://x.ai',
    supportsStreaming: true,
    supportsTools: true,
    backendProvider: 'openai-compatible',
    defaultBaseUrl: 'https://api.x.ai/v1',
  },
  {
    id: 'mistral',
    name: 'Mistral',
    description: 'Mistral Large, Small, and Codestral',
    authModes: ['managed', 'byok', 'hybrid'],
    website: 'https://mistral.ai',
    supportsStreaming: true,
    supportsTools: true,
    backendProvider: 'openai-compatible',
    defaultBaseUrl: 'https://api.mistral.ai/v1',
  },
  {
    id: 'llama',
    name: 'Meta Llama',
    description: 'Llama 4 and Llama 3 open models',
    authModes: ['managed', 'byok'],
    website: 'https://llama.meta.com',
    supportsStreaming: true,
    supportsTools: true,
    backendProvider: 'openai-compatible',
  },
  {
    id: 'qwen',
    name: 'Qwen',
    description: 'Alibaba Qwen Max and Qwen 2.5',
    authModes: ['managed', 'byok'],
    website: 'https://qwenlm.github.io',
    supportsStreaming: true,
    supportsTools: true,
    backendProvider: 'openai-compatible',
  },
  {
    id: 'ollama',
    name: 'Ollama',
    description: 'Local open-source models',
    authModes: ['byok'],
    website: 'https://ollama.com',
    supportsStreaming: true,
    supportsTools: false,
    backendProvider: 'openai-compatible',
    defaultBaseUrl: 'http://localhost:11434/v1',
  },
  {
    id: 'huggingface',
    name: 'HuggingFace',
    description: 'Inference API for open models',
    authModes: ['byok'],
    website: 'https://huggingface.co',
    supportsStreaming: true,
    supportsTools: false,
    backendProvider: 'openai-compatible',
    defaultBaseUrl: 'https://api-inference.huggingface.co/v1',
  },
  {
    id: 'together',
    name: 'Together AI',
    description: 'Fast inference for open models',
    authModes: ['managed', 'byok'],
    website: 'https://together.ai',
    supportsStreaming: true,
    supportsTools: true,
    backendProvider: 'openai-compatible',
    defaultBaseUrl: 'https://api.together.xyz/v1',
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra-low latency inference',
    authModes: ['managed', 'byok'],
    website: 'https://groq.com',
    supportsStreaming: true,
    supportsTools: true,
    backendProvider: 'openai-compatible',
    defaultBaseUrl: 'https://api.groq.com/openai/v1',
  },
  {
    id: 'fireworks',
    name: 'Fireworks',
    description: 'Fast fine-tuned and open models',
    authModes: ['managed', 'byok'],
    website: 'https://fireworks.ai',
    supportsStreaming: true,
    supportsTools: true,
    backendProvider: 'openai-compatible',
    defaultBaseUrl: 'https://api.fireworks.ai/inference/v1',
  },
  {
    id: 'cerebras',
    name: 'Cerebras',
    description: 'Ultra-fast inference on Cerebras hardware',
    authModes: ['managed', 'byok'],
    website: 'https://cerebras.ai',
    supportsStreaming: true,
    supportsTools: true,
    backendProvider: 'openai-compatible',
    defaultBaseUrl: 'https://api.cerebras.ai/v1',
  },
  {
    id: 'sambanova',
    name: 'SambaNova',
    description: 'Enterprise AI on SambaNova Cloud',
    authModes: ['managed', 'byok'],
    website: 'https://cloud.sambanova.ai',
    supportsStreaming: true,
    supportsTools: true,
    backendProvider: 'openai-compatible',
    defaultBaseUrl: 'https://api.sambanova.ai/v1',
  },
];

function model(
  id: string,
  providerId: HubProviderId,
  providerName: string,
  modelName: string,
  displayName: string,
  description: string,
  speed: ModelCatalogEntry['speed'],
  quality: ModelCatalogEntry['quality'],
  tier: ModelCatalogEntry['tier'],
  contextLength: number,
  inputCost: number,
  outputCost: number,
  bestUseCases: string[],
  tags: string[] = [],
): ModelCatalogEntry {
  return {
    id,
    providerId,
    providerName,
    model: modelName,
    displayName,
    description,
    speed,
    quality,
    tier,
    contextLength,
    inputCostPer1M: inputCost,
    outputCostPer1M: outputCost,
    availability: 'available',
    bestUseCases,
    tags,
  };
}

/** Static model catalog — demo data for static export */
export const MODEL_CATALOG: ModelCatalogEntry[] = [
  model('gpt-5', 'openai', 'OpenAI', 'gpt-5', 'GPT-5', 'Frontier reasoning and coding', 'balanced', 'frontier', 'frontier', 256000, 15, 60, ['Complex reasoning', 'Agent workflows', 'Code generation'], ['flagship']),
  model('gpt-4o', 'openai', 'OpenAI', 'gpt-4o', 'GPT-4o', 'Multimodal flagship', 'balanced', 'frontier', 'premium', 128000, 5, 15, ['Chat', 'Vision', 'Tools'], ['multimodal']),
  model('gpt-4o-mini', 'openai', 'OpenAI', 'gpt-4o-mini', 'GPT-4o Mini', 'Fast, cost-effective', 'fast', 'great', 'standard', 128000, 0.15, 0.6, ['High-volume chat', 'Classification'], ['fast']),
  model('o3-mini', 'openai', 'OpenAI', 'o3-mini', 'o3-mini', 'Reasoning optimized', 'balanced', 'frontier', 'premium', 200000, 3, 12, ['Math', 'Logic', 'Planning'], ['reasoning']),

  model('claude-sonnet-4', 'anthropic', 'Claude', 'claude-sonnet-4-20250514', 'Claude Sonnet 4', 'Best balance of speed and intelligence', 'balanced', 'frontier', 'premium', 200000, 3, 15, ['Coding', 'Analysis', 'Writing'], ['flagship']),
  model('claude-opus-4', 'anthropic', 'Claude', 'claude-opus-4-20250514', 'Claude Opus 4', 'Maximum capability', 'quality', 'frontier', 'frontier', 200000, 15, 75, ['Research', 'Complex agents'], ['frontier']),
  model('claude-haiku', 'anthropic', 'Claude', 'claude-3-5-haiku-latest', 'Claude Haiku', 'Fast responses', 'fast', 'great', 'standard', 200000, 0.8, 4, ['Support', 'Triage', 'Summaries'], ['fast']),

  model('gemini-pro', 'gemini', 'Gemini', 'gemini-2.5-pro', 'Gemini Pro', 'Google flagship multimodal', 'balanced', 'frontier', 'premium', 1000000, 2.5, 10, ['Long context', 'Multimodal', 'Research'], ['multimodal']),
  model('gemini-flash', 'gemini', 'Gemini', 'gemini-2.5-flash', 'Gemini Flash', 'Ultra-fast Gemini', 'fast', 'great', 'standard', 1000000, 0.15, 0.6, ['Real-time', 'High volume'], ['fast']),

  model('deepseek-v3', 'openrouter', 'OpenRouter', 'deepseek/deepseek-chat', 'DeepSeek V3', 'Strong coding and math', 'balanced', 'great', 'premium', 64000, 0.27, 1.1, ['Code', 'Math', 'Cost-efficient'], ['coding']),
  model('deepseek-r1', 'openrouter', 'OpenRouter', 'deepseek/deepseek-r1', 'DeepSeek R1', 'Chain-of-thought reasoning', 'quality', 'frontier', 'premium', 64000, 0.55, 2.19, ['Reasoning', 'Proofs'], ['reasoning']),
  model('deepseek-free', 'openrouter', 'OpenRouter', 'deepseek/deepseek-chat:free', 'DeepSeek Free', 'Free tier DeepSeek via OpenRouter', 'fast', 'good', 'free', 64000, 0, 0, ['Free chat', 'Experiments'], ['free']),

  model('claude-sonnet-or', 'openrouter', 'OpenRouter', 'anthropic/claude-sonnet-4', 'Claude Sonnet (OpenRouter)', 'Claude Sonnet via OpenRouter', 'balanced', 'frontier', 'premium', 200000, 3, 15, ['Coding', 'Analysis'], ['openrouter']),
  model('qwen-or', 'openrouter', 'OpenRouter', 'qwen/qwen-2.5-72b-instruct', 'Qwen 2.5 72B (OpenRouter)', 'Alibaba Qwen via OpenRouter', 'balanced', 'great', 'standard', 131072, 0.35, 0.4, ['Chinese/English', 'Coding'], ['openrouter']),

  model('mistral-large', 'mistral', 'Mistral', 'mistral-large-latest', 'Mistral Large', 'European flagship', 'balanced', 'great', 'premium', 128000, 2, 6, ['EU compliance', 'Multilingual'], ['eu']),
  model('mistral-small', 'mistral', 'Mistral', 'mistral-small-latest', 'Mistral Small', 'Efficient general purpose', 'fast', 'good', 'standard', 128000, 0.2, 0.6, ['Chat', 'Classification'], ['fast']),
  model('codestral', 'mistral', 'Mistral', 'codestral-latest', 'Codestral', 'Code-specialized', 'fast', 'great', 'premium', 256000, 0.3, 0.9, ['IDE completion', 'Refactoring'], ['coding']),

  model('llama-4-70b', 'llama', 'Llama', 'meta-llama/llama-4-70b', 'Llama 4 70B', 'Open frontier model', 'balanced', 'great', 'standard', 128000, 0.4, 0.4, ['Self-host', 'Fine-tuning'], ['open']),
  model('llama-3.3-70b', 'llama', 'Llama', 'meta-llama/llama-3.3-70b', 'Llama 3.3 70B', 'Proven open model', 'balanced', 'good', 'free', 128000, 0.2, 0.2, ['General chat', 'RAG'], ['open']),

  model('qwen-max', 'qwen', 'Qwen', 'qwen-max', 'Qwen Max', 'Alibaba flagship', 'balanced', 'great', 'premium', 131072, 1.6, 6.4, ['Chinese/English', 'Enterprise'], ['multilingual']),
  model('qwen-2.5-72b', 'qwen', 'Qwen', 'qwen-2.5-72b-instruct', 'Qwen 2.5 72B', 'Strong open model', 'balanced', 'great', 'standard', 131072, 0.35, 0.4, ['Coding', 'Math'], ['open']),

  model('groq-llama-70b', 'groq', 'Groq', 'llama-3.3-70b-versatile', 'Groq Llama 70B', 'Ultra-low latency', 'fast', 'good', 'standard', 128000, 0.59, 0.79, ['Real-time chat', 'Voice'], ['latency']),
  model('groq-mixtral', 'groq', 'Groq', 'mixtral-8x7b-32768', 'Groq Mixtral', 'Fast mixture-of-experts', 'fast', 'good', 'standard', 32768, 0.24, 0.24, ['Fast inference'], ['latency']),

  model('grok-2', 'grok', 'Grok', 'grok-2-latest', 'Grok 2', 'xAI conversational model', 'balanced', 'great', 'premium', 131072, 2, 10, ['Real-time info', 'Chat'], []),

  model('openrouter-auto', 'openrouter', 'OpenRouter', 'openrouter/auto', 'OpenRouter Auto', 'Routes to best available', 'balanced', 'great', 'standard', 128000, 1, 3, ['Fallback routing'], ['router']),

  model('cerebras-llama', 'cerebras', 'Cerebras', 'llama3.1-8b', 'Cerebras Llama 3.1 8B', 'Ultra-fast Cerebras inference', 'fast', 'good', 'standard', 8192, 0.1, 0.1, ['Low latency', 'High volume'], ['cerebras']),
  model('cerebras-70b', 'cerebras', 'Cerebras', 'llama-3.3-70b', 'Cerebras Llama 3.3 70B', 'Fast 70B on Cerebras', 'fast', 'great', 'premium', 128000, 0.6, 0.6, ['Production chat'], ['cerebras']),

  model('sambanova-llama', 'sambanova', 'SambaNova', 'Meta-Llama-3.1-405B-Instruct', 'SambaNova Llama 405B', 'Large model on SambaNova Cloud', 'balanced', 'frontier', 'frontier', 128000, 5, 15, ['Enterprise', 'Research'], ['sambanova']),
  model('sambanova-deepseek', 'sambanova', 'SambaNova', 'DeepSeek-V3-0324', 'SambaNova DeepSeek V3', 'DeepSeek on SambaNova', 'balanced', 'great', 'premium', 64000, 1, 3, ['Code', 'Reasoning'], ['sambanova']),

  model('ollama-llama3', 'ollama', 'Ollama', 'llama3.2', 'Ollama Llama 3.2', 'Local offline model', 'fast', 'good', 'free', 128000, 0, 0, ['Privacy', 'Offline'], ['local']),
  model('hf-mistral-7b', 'huggingface', 'HuggingFace', 'mistralai/Mistral-7B-Instruct-v0.3', 'HF Mistral 7B', 'Hosted open model', 'fast', 'good', 'free', 32768, 0.1, 0.1, ['Experiments'], ['open']),
  model('together-llama', 'together', 'Together', 'meta-llama/Llama-3.3-70B-Instruct-Turbo', 'Together Llama 70B', 'Fast open inference', 'fast', 'good', 'standard', 128000, 0.88, 0.88, ['Scale', 'Fine-tunes'], []),
  model('fireworks-llama', 'fireworks', 'Fireworks', 'accounts/fireworks/models/llama-v3p3-70b-instruct', 'Fireworks Llama 70B', 'Optimized inference', 'fast', 'good', 'standard', 128000, 0.9, 0.9, ['Production', 'Low latency'], []),
];

export class ProviderRegistry {
  private readonly providers: Map<HubProviderId, ProviderDefinition>;

  constructor(defs: ProviderDefinition[] = PROVIDER_DEFINITIONS) {
    this.providers = new Map(defs.map((p) => [p.id, p]));
  }

  list(): ProviderDefinition[] {
    return [...this.providers.values()];
  }

  get(id: HubProviderId): ProviderDefinition | undefined {
    return this.providers.get(id);
  }

  listByAuthMode(mode: import('./types.js').AuthMode): ProviderDefinition[] {
    return this.list().filter((p) => p.authModes.includes(mode));
  }
}

export class ModelCatalog {
  private readonly models: Map<string, ModelCatalogEntry>;

  constructor(entries: ModelCatalogEntry[] = MODEL_CATALOG) {
    this.models = new Map(entries.map((m) => [m.id, m]));
  }

  list(): ModelCatalogEntry[] {
    return [...this.models.values()];
  }

  get(id: string): ModelCatalogEntry | undefined {
    return this.models.get(id);
  }

  count(): number {
    return this.models.size;
  }

  search(filters: import('./types.js').CatalogSearchFilters = {}): ModelCatalogEntry[] {
    let results = this.list();

    if (filters.providerId) {
      results = results.filter((m) => m.providerId === filters.providerId);
    }
    if (filters.tier) {
      results = results.filter((m) => m.tier === filters.tier);
    }
    if (filters.speed) {
      results = results.filter((m) => m.speed === filters.speed);
    }
    if (filters.quality) {
      results = results.filter((m) => m.quality === filters.quality);
    }
    if (filters.availability) {
      results = results.filter((m) => m.availability === filters.availability);
    }
    if (filters.query) {
      const q = filters.query.toLowerCase();
      results = results.filter(
        (m) =>
          m.displayName.toLowerCase().includes(q) ||
          m.model.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.tags.some((t) => t.includes(q)) ||
          m.bestUseCases.some((u) => u.toLowerCase().includes(q)),
      );
    }

    return results;
  }

  listByProvider(providerId: HubProviderId): ModelCatalogEntry[] {
    return this.list().filter((m) => m.providerId === providerId);
  }
}

export const defaultProviderRegistry = new ProviderRegistry();
export const defaultModelCatalog = new ModelCatalog();
