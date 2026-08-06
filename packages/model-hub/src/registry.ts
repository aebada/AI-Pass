import type {
  AIPassFamily,
  ModelCapability,
  ModelPricingTier,
  ModelRecord,
} from './types.js';

function pricing(
  tier: ModelPricingTier,
  inputCredits: number,
  outputCredits: number,
  inputUsd?: number,
  outputUsd?: number,
) {
  return {
    tier,
    inputCreditsPer1K: inputCredits,
    outputCreditsPer1K: outputCredits,
    inputCostPer1M: inputUsd,
    outputCostPer1M: outputUsd,
  };
}

function trust(trust: number, reliability: number, hallucinationRisk: number) {
  return { trust, reliability, hallucinationRisk };
}

function m(
  id: string,
  providerId: ModelRecord['providerId'],
  provider: string,
  name: string,
  displayName: string,
  description: string,
  opts: Partial<ModelRecord> & {
    tier: ModelPricingTier;
    inputCredits: number;
    outputCredits: number;
    inputUsd?: number;
    outputUsd?: number;
    useCases: string[];
    contextLength: number;
  },
): ModelRecord {
  const caps: ModelCapability[] = opts.capabilities ?? ['chat'];
  return {
    id,
    name,
    displayName,
    provider,
    providerId,
    category: opts.category ?? (providerId === 'aipass' ? 'aipass' : 'provider'),
    family: opts.family,
    description,
    purpose: opts.purpose,
    capabilities: caps,
    pricing: pricing(opts.tier, opts.inputCredits, opts.outputCredits, opts.inputUsd, opts.outputUsd),
    status: opts.status ?? 'available',
    useCases: opts.useCases,
    contextLength: opts.contextLength,
    tags: opts.tags ?? [],
    hubModelId: opts.hubModelId ?? id,
    endpoint: opts.endpoint,
    certified: opts.certified ?? false,
    isEnterprise: opts.isEnterprise ?? false,
    isLocal: opts.isLocal ?? false,
    isOpenSource: opts.isOpenSource ?? false,
    supportsVision: opts.supportsVision ?? (caps.includes('vision') || caps.includes('multimodal')),
    supportsVoice: opts.supportsVoice ?? caps.includes('voice'),
    supportsToolCalling: opts.supportsToolCalling ?? (caps.includes('tool-calling') || caps.includes('agent')),
    latencyMs: opts.latencyMs ?? 800,
    minPlan: opts.minPlan ?? (opts.tier === 'frontier' ? 'power' : opts.tier === 'premium' ? 'professional' : 'free'),
    trust: opts.trust ?? trust(85, 88, 12),
    benchmarkScore: opts.benchmarkScore,
  };
}

/** AI-Pass Enterprise Model family */
const AIPASS_FAMILY: Array<{ family: AIPassFamily; label: string; purpose: string }> = [
  { family: 'general', label: 'AI-Pass General', purpose: 'General-purpose enterprise assistant' },
  { family: 'enterprise', label: 'AI-Pass Enterprise', purpose: 'Large-scale enterprise workloads' },
  { family: 'finance', label: 'AI-Pass Finance', purpose: 'Invoice, AP, treasury, and financial analysis' },
  { family: 'supply', label: 'AI-Pass Supply', purpose: 'Procurement, sourcing, and supply chain' },
  { family: 'hr', label: 'AI-Pass HR', purpose: 'HR policies, onboarding, and workforce' },
  { family: 'legal', label: 'AI-Pass Legal', purpose: 'Contract review and legal research' },
  { family: 'analyst', label: 'AI-Pass Analyst', purpose: 'Business intelligence and analytics' },
  { family: 'compliance', label: 'AI-Pass Compliance', purpose: 'Regulatory and audit workflows' },
  { family: 'support', label: 'AI-Pass Support', purpose: 'Customer support and ticketing' },
];

function aipassModels(): ModelRecord[] {
  return AIPASS_FAMILY.map(({ family, label, purpose }) =>
    m(`aipass-${family}`, 'aipass', 'AI-Pass', `aipass-${family}`, label, purpose, {
      tier: family === 'enterprise' || family === 'compliance' ? 'frontier' : 'premium',
      inputCredits: family === 'general' ? 2 : 3,
      outputCredits: family === 'general' ? 6 : 9,
      useCases: [purpose, 'Enterprise apps', 'Governed routing'],
      contextLength: 256000,
      family,
      purpose,
      category: 'aipass',
      certified: true,
      isEnterprise: true,
      capabilities: ['chat', 'agent', 'tool-calling', 'reasoning'],
      tags: ['aipass', 'enterprise', family],
      hubModelId: 'claude-sonnet-4',
      minPlan: family === 'general' ? 'professional' : 'enterprise',
      trust: trust(96, 94, 6),
      benchmarkScore: 88 + (family === 'compliance' ? 4 : 0),
      latencyMs: 600,
    }),
  );
}

/** Third-party and open-source models */
const THIRD_PARTY: ModelRecord[] = [
  m('gpt-4o-mini', 'openai', 'OpenAI', 'gpt-4o-mini', 'GPT-4o Mini', 'Fast, cost-effective', {
    tier: 'standard', inputCredits: 1, outputCredits: 2, inputUsd: 0.15, outputUsd: 0.6,
    useCases: ['High-volume chat', 'Classification'], contextLength: 128000,
    capabilities: ['chat', 'completion'], tags: ['fast'], benchmarkScore: 82, latencyMs: 400,
    trust: trust(86, 87, 14),
  }),
  m('gpt-4o', 'openai', 'OpenAI', 'gpt-4o', 'GPT-4o', 'Multimodal flagship', {
    tier: 'premium', inputCredits: 3, outputCredits: 9, inputUsd: 5, outputUsd: 15,
    useCases: ['Chat', 'Vision', 'Tools'], contextLength: 128000,
    capabilities: ['chat', 'vision', 'multimodal', 'tool-calling', 'agent'], tags: ['multimodal'],
    certified: true, supportsVision: true, benchmarkScore: 91, latencyMs: 900,
    trust: trust(90, 89, 11),
  }),
  m('gpt-5.6-luna', 'openai', 'OpenAI', 'gpt-5.6-luna', 'GPT-5.6 Luna', 'Efficient high-volume GPT-5.6', {
    tier: 'standard', inputCredits: 1, outputCredits: 4, inputUsd: 1, outputUsd: 4,
    useCases: ['High volume', 'Classification'], contextLength: 256000,
    capabilities: ['chat', 'code'], tags: ['gpt-5.6'], latencyMs: 500,
    trust: trust(88, 88, 12),
  }),
  m('gpt-5.6-terra', 'openai', 'OpenAI', 'gpt-5.6-terra', 'GPT-5.6 Terra', 'Balanced intelligence and cost', {
    tier: 'premium', inputCredits: 4, outputCredits: 12, inputUsd: 5, outputUsd: 20,
    useCases: ['Agents', 'Coding'], contextLength: 256000,
    capabilities: ['chat', 'reasoning', 'code', 'agent', 'tool-calling'], tags: ['gpt-5.6'],
    certified: true, benchmarkScore: 93, latencyMs: 900, trust: trust(91, 90, 10),
  }),
  m('gpt-5.6-sol', 'openai', 'OpenAI', 'gpt-5.6-sol', 'GPT-5.6 Sol', 'Frontier GPT-5.6 for complex work', {
    tier: 'frontier', inputCredits: 8, outputCredits: 24, inputUsd: 15, outputUsd: 60,
    useCases: ['Complex reasoning', 'Agent workflows'], contextLength: 256000,
    capabilities: ['chat', 'reasoning', 'code', 'agent', 'tool-calling'], tags: ['flagship', 'gpt-5.6'],
    certified: true, benchmarkScore: 96, latencyMs: 1200, minPlan: 'power',
    trust: trust(94, 92, 8),
  }),
  m('gpt-5', 'openai', 'OpenAI', 'gpt-5.6-sol', 'GPT-5.6', 'Alias for GPT-5.6 Sol', {
    tier: 'frontier', inputCredits: 8, outputCredits: 24, inputUsd: 15, outputUsd: 60,
    useCases: ['Complex reasoning', 'Code generation'], contextLength: 256000,
    capabilities: ['chat', 'reasoning', 'code', 'agent', 'tool-calling'], tags: ['flagship'],
    certified: true, benchmarkScore: 96, latencyMs: 1200, minPlan: 'power',
    trust: trust(94, 92, 8),
  }),
  m('o3-mini', 'openai', 'OpenAI', 'o3-mini', 'o3-mini', 'Reasoning optimized', {
    tier: 'premium', inputCredits: 4, outputCredits: 12, inputUsd: 3, outputUsd: 12,
    useCases: ['Math', 'Logic', 'Planning'], contextLength: 200000,
    capabilities: ['reasoning', 'chat'], tags: ['reasoning'], minPlan: 'power',
    benchmarkScore: 93, latencyMs: 1500, trust: trust(91, 88, 9),
  }),

  m('claude-haiku', 'anthropic', 'Claude', 'claude-haiku', 'Claude Haiku 4.5', 'Fast Claude responses', {
    tier: 'standard', inputCredits: 1, outputCredits: 3, inputUsd: 0.8, outputUsd: 4,
    useCases: ['Support', 'Triage', 'Summaries'], contextLength: 200000,
    capabilities: ['chat', 'completion'], tags: ['fast'], latencyMs: 350,
    trust: trust(88, 90, 12),
  }),
  m('claude-sonnet-4', 'anthropic', 'Claude', 'claude-sonnet-4', 'Claude Sonnet 4', 'Balanced Claude 4', {
    tier: 'premium', inputCredits: 3, outputCredits: 9, inputUsd: 3, outputUsd: 15,
    useCases: ['Coding', 'Analysis', 'Writing'], contextLength: 200000,
    capabilities: ['chat', 'code', 'agent', 'tool-calling'],
    certified: true, benchmarkScore: 92, latencyMs: 850,
    trust: trust(93, 92, 8),
  }),
  m('claude-sonnet-5', 'anthropic', 'Claude', 'claude-sonnet-5', 'Claude Sonnet 5', 'Latest Sonnet mid-tier', {
    tier: 'premium', inputCredits: 3, outputCredits: 9, inputUsd: 3, outputUsd: 15,
    useCases: ['Coding', 'Agents'], contextLength: 200000,
    capabilities: ['chat', 'code', 'agent', 'tool-calling'], tags: ['flagship'],
    certified: true, benchmarkScore: 94, latencyMs: 800,
    trust: trust(94, 93, 7),
  }),
  m('claude-opus-4', 'anthropic', 'Claude', 'claude-opus-4', 'Claude Opus 4', 'Claude 4 maximum capability', {
    tier: 'frontier', inputCredits: 10, outputCredits: 30, inputUsd: 15, outputUsd: 75,
    useCases: ['Research', 'Complex agents'], contextLength: 200000,
    capabilities: ['chat', 'reasoning', 'agent', 'tool-calling'], tags: ['frontier'],
    certified: true, minPlan: 'power', benchmarkScore: 95, latencyMs: 1400,
    trust: trust(94, 91, 7),
  }),
  m('claude-opus-5', 'anthropic', 'Claude', 'claude-opus-5', 'Claude Opus 5', 'Latest Opus frontier', {
    tier: 'frontier', inputCredits: 10, outputCredits: 30, inputUsd: 15, outputUsd: 75,
    useCases: ['Research', 'Deep agents'], contextLength: 200000,
    capabilities: ['chat', 'reasoning', 'agent', 'tool-calling'], tags: ['flagship', 'frontier'],
    certified: true, minPlan: 'power', benchmarkScore: 97, latencyMs: 1300,
    trust: trust(95, 93, 6),
  }),

  m('gemini-flash', 'gemini', 'Google Gemini', 'gemini-flash', 'Gemini 2.5 Flash', 'Ultra-fast Gemini', {
    tier: 'standard', inputCredits: 1, outputCredits: 2, inputUsd: 0.15, outputUsd: 0.6,
    useCases: ['Real-time', 'High volume'], contextLength: 1000000,
    capabilities: ['chat', 'vision'], tags: ['fast'], latencyMs: 300,
    trust: trust(85, 86, 13),
  }),
  m('gemini-3.6-flash', 'gemini', 'Google Gemini', 'gemini-3.6-flash', 'Gemini 3.6 Flash', 'Latest Gemini Flash workhorse', {
    tier: 'standard', inputCredits: 1, outputCredits: 2, inputUsd: 0.2, outputUsd: 0.8,
    useCases: ['Real-time', 'Multimodal'], contextLength: 1000000,
    capabilities: ['chat', 'vision', 'multimodal'], tags: ['fast', 'flagship'], latencyMs: 280,
    trust: trust(88, 88, 11),
  }),
  m('gemini-pro', 'gemini', 'Google Gemini', 'gemini-pro', 'Gemini 2.5 Pro', 'Google multimodal Pro', {
    tier: 'premium', inputCredits: 3, outputCredits: 8, inputUsd: 2.5, outputUsd: 10,
    useCases: ['Long context', 'Multimodal', 'Research'], contextLength: 1000000,
    capabilities: ['chat', 'vision', 'multimodal', 'tool-calling'], tags: ['multimodal'],
    certified: true, supportsVision: true, benchmarkScore: 90, latencyMs: 950,
    trust: trust(89, 88, 11),
  }),
  m('gemini-3.1-pro', 'gemini', 'Google Gemini', 'gemini-3.1-pro', 'Gemini 3.1 Pro', 'Latest Gemini Pro preview', {
    tier: 'frontier', inputCredits: 4, outputCredits: 12, inputUsd: 3, outputUsd: 12,
    useCases: ['Long context', 'Research'], contextLength: 1000000,
    capabilities: ['chat', 'vision', 'multimodal', 'tool-calling', 'reasoning'], tags: ['flagship'],
    certified: true, supportsVision: true, minPlan: 'power', benchmarkScore: 94, latencyMs: 1000,
    trust: trust(91, 90, 9),
  }),

  m('deepseek-v3', 'deepseek', 'DeepSeek', 'deepseek-v3', 'DeepSeek V3', 'Strong coding and math', {
    tier: 'premium', inputCredits: 1, outputCredits: 3, inputUsd: 0.27, outputUsd: 1.1,
    useCases: ['Code', 'Math', 'Cost-efficient'], contextLength: 64000,
    capabilities: ['chat', 'code', 'reasoning'], tags: ['coding'],
    benchmarkScore: 89, latencyMs: 700, trust: trust(87, 85, 14),
  }),
  m('deepseek-r1', 'deepseek', 'DeepSeek', 'deepseek-r1', 'DeepSeek R1', 'Chain-of-thought reasoning', {
    tier: 'premium', inputCredits: 2, outputCredits: 5, inputUsd: 0.55, outputUsd: 2.19,
    useCases: ['Reasoning', 'Proofs'], contextLength: 64000,
    capabilities: ['reasoning', 'chat'], tags: ['reasoning'],
    benchmarkScore: 91, latencyMs: 1100, trust: trust(86, 84, 15),
  }),
  m('deepseek-free', 'openrouter', 'OpenRouter', 'deepseek-free', 'DeepSeek Free', 'Free tier DeepSeek via OpenRouter', {
    tier: 'free', inputCredits: 0, outputCredits: 0,
    useCases: ['Free chat', 'Experiments'], contextLength: 64000,
    capabilities: ['chat'], tags: ['free'], category: 'open-source',
    isOpenSource: true, latencyMs: 900, trust: trust(80, 78, 18),
  }),

  m('mistral-large', 'mistral', 'Mistral', 'mistral-large', 'Mistral Large', 'European flagship', {
    tier: 'premium', inputCredits: 2, outputCredits: 6, inputUsd: 2, outputUsd: 6,
    useCases: ['EU compliance', 'Multilingual'], contextLength: 128000,
    capabilities: ['chat', 'agent', 'tool-calling'], tags: ['eu'],
    certified: true, benchmarkScore: 87, trust: trust(88, 87, 12),
  }),
  m('mistral-small', 'mistral', 'Mistral', 'mistral-small', 'Mistral Small', 'Efficient general purpose', {
    tier: 'standard', inputCredits: 1, outputCredits: 2, inputUsd: 0.2, outputUsd: 0.6,
    useCases: ['Chat', 'Classification'], contextLength: 128000,
    capabilities: ['chat'], tags: ['fast'], latencyMs: 450,
    trust: trust(84, 85, 14),
  }),
  m('codestral', 'mistral', 'Mistral', 'codestral', 'Codestral', 'Code-specialized', {
    tier: 'premium', inputCredits: 1, outputCredits: 3, inputUsd: 0.3, outputUsd: 0.9,
    useCases: ['IDE completion', 'Refactoring'], contextLength: 256000,
    capabilities: ['code', 'completion'], tags: ['coding'],
    benchmarkScore: 88, latencyMs: 500, trust: trust(87, 86, 13),
  }),

  m('llama-4-70b', 'llama', 'Meta Llama', 'llama-4-70b', 'Llama 4 70B', 'Open frontier model', {
    tier: 'standard', inputCredits: 1, outputCredits: 2, inputUsd: 0.4, outputUsd: 0.4,
    useCases: ['Self-host', 'Fine-tuning'], contextLength: 128000,
    capabilities: ['chat', 'code'], category: 'open-source', isOpenSource: true,
    tags: ['open'], benchmarkScore: 85, trust: trust(82, 80, 16),
  }),
  m('llama-3.3-70b', 'llama', 'Meta Llama', 'llama-3.3-70b', 'Llama 3.3 70B', 'Proven open model', {
    tier: 'free', inputCredits: 0, outputCredits: 0, inputUsd: 0.2, outputUsd: 0.2,
    useCases: ['General chat', 'RAG'], contextLength: 128000,
    capabilities: ['chat'], category: 'open-source', isOpenSource: true,
    tags: ['open'], trust: trust(80, 79, 17),
  }),

  m('qwen-max', 'qwen', 'Qwen', 'qwen-max', 'Qwen Max', 'Alibaba flagship', {
    tier: 'premium', inputCredits: 2, outputCredits: 6, inputUsd: 1.6, outputUsd: 6.4,
    useCases: ['Chinese/English', 'Enterprise'], contextLength: 131072,
    capabilities: ['chat', 'multimodal'], tags: ['multilingual'],
    benchmarkScore: 86, trust: trust(86, 85, 13),
  }),
  m('qwen-2.5-72b', 'qwen', 'Qwen', 'qwen-2.5-72b', 'Qwen 2.5 72B', 'Strong open model', {
    tier: 'standard', inputCredits: 1, outputCredits: 2, inputUsd: 0.35, outputUsd: 0.4,
    useCases: ['Coding', 'Math'], contextLength: 131072,
    capabilities: ['chat', 'code'], category: 'open-source', isOpenSource: true,
    trust: trust(84, 83, 14),
  }),

  m('groq-llama-70b', 'groq', 'Groq', 'groq-llama-70b', 'Groq Llama 70B', 'Ultra-low latency', {
    tier: 'standard', inputCredits: 1, outputCredits: 2, inputUsd: 0.59, outputUsd: 0.79,
    useCases: ['Real-time chat', 'Voice'], contextLength: 128000,
    capabilities: ['chat', 'voice'], supportsVoice: true, tags: ['latency'],
    latencyMs: 120, trust: trust(83, 84, 15),
  }),
  m('grok-2', 'grok', 'Grok', 'grok-2', 'Grok 2', 'xAI conversational model', {
    tier: 'premium', inputCredits: 3, outputCredits: 9, inputUsd: 2, outputUsd: 10,
    useCases: ['Real-time info', 'Chat'], contextLength: 131072,
    capabilities: ['chat', 'agent'], minPlan: 'power',
    benchmarkScore: 86, trust: trust(84, 82, 16),
  }),
  m('grok-4.3', 'grok', 'Grok', 'grok-4.3', 'Grok 4.3', 'Long-context Grok workhorse', {
    tier: 'premium', inputCredits: 4, outputCredits: 12, inputUsd: 3, outputUsd: 12,
    useCases: ['Long context', 'Tools'], contextLength: 1000000,
    capabilities: ['chat', 'agent', 'tool-calling'], minPlan: 'power',
    benchmarkScore: 90, trust: trust(88, 86, 12),
  }),
  m('grok-4.5', 'grok', 'Grok', 'grok-4.5', 'Grok 4.5', 'Latest Grok coding and agents flagship', {
    tier: 'frontier', inputCredits: 6, outputCredits: 18, inputUsd: 5, outputUsd: 20,
    useCases: ['Coding', 'Agents'], contextLength: 500000,
    capabilities: ['chat', 'code', 'agent', 'reasoning', 'tool-calling'], tags: ['flagship'],
    minPlan: 'power', benchmarkScore: 93, trust: trust(91, 89, 10),
  }),

  m('openrouter-auto', 'openrouter', 'OpenRouter', 'openrouter-auto', 'OpenRouter Auto', 'Routes to best available', {
    tier: 'standard', inputCredits: 1, outputCredits: 3, inputUsd: 1, outputUsd: 3,
    useCases: ['Fallback routing'], contextLength: 128000,
    capabilities: ['chat', 'agent'], tags: ['router'],
    trust: trust(82, 80, 16),
  }),

  m('cerebras-llama', 'cerebras', 'Cerebras', 'cerebras-llama', 'Cerebras Llama 3.1 8B', 'Ultra-fast Cerebras inference', {
    tier: 'standard', inputCredits: 1, outputCredits: 1, inputUsd: 0.1, outputUsd: 0.1,
    useCases: ['Low latency', 'High volume'], contextLength: 8192,
    capabilities: ['chat'], tags: ['cerebras'], latencyMs: 80, minPlan: 'power',
    trust: trust(81, 82, 15),
  }),
  m('cerebras-70b', 'cerebras', 'Cerebras', 'cerebras-70b', 'Cerebras Llama 3.3 70B', 'Fast 70B on Cerebras', {
    tier: 'premium', inputCredits: 2, outputCredits: 4, inputUsd: 0.6, outputUsd: 0.6,
    useCases: ['Production chat'], contextLength: 128000,
    capabilities: ['chat'], tags: ['cerebras'], latencyMs: 150, minPlan: 'power',
    trust: trust(83, 84, 14),
  }),

  m('sambanova-llama', 'sambanova', 'SambaNova', 'sambanova-llama', 'SambaNova Llama 405B', 'Large model on SambaNova Cloud', {
    tier: 'frontier', inputCredits: 6, outputCredits: 18, inputUsd: 5, outputUsd: 15,
    useCases: ['Enterprise', 'Research'], contextLength: 128000,
    capabilities: ['chat', 'reasoning'], isEnterprise: true, minPlan: 'power',
    certified: true, benchmarkScore: 92, trust: trust(90, 89, 10),
  }),
  m('sambanova-deepseek', 'sambanova', 'SambaNova', 'sambanova-deepseek', 'SambaNova DeepSeek V3', 'DeepSeek on SambaNova', {
    tier: 'premium', inputCredits: 2, outputCredits: 5, inputUsd: 1, outputUsd: 3,
    useCases: ['Code', 'Reasoning'], contextLength: 64000,
    capabilities: ['code', 'reasoning'], minPlan: 'power',
    trust: trust(87, 86, 13),
  }),

  m('ollama-llama3', 'ollama', 'Ollama', 'ollama-llama3', 'Ollama Llama 3.2', 'Local offline model', {
    tier: 'free', inputCredits: 0, outputCredits: 0,
    useCases: ['Privacy', 'Offline'], contextLength: 128000,
    capabilities: ['chat'], category: 'private', isLocal: true, isOpenSource: true,
    tags: ['local'], endpoint: 'http://localhost:11434/v1',
    trust: trust(78, 76, 18),
  }),
  m('hf-mistral-7b', 'huggingface', 'HuggingFace', 'hf-mistral-7b', 'HF Mistral 7B', 'Hosted open model', {
    tier: 'free', inputCredits: 0, outputCredits: 0, inputUsd: 0.1, outputUsd: 0.1,
    useCases: ['Experiments'], contextLength: 32768,
    capabilities: ['chat'], category: 'open-source', isOpenSource: true,
    tags: ['open'], trust: trust(76, 75, 19),
  }),
  m('together-llama', 'together', 'Together', 'together-llama', 'Together Llama 70B', 'Fast open inference', {
    tier: 'standard', inputCredits: 1, outputCredits: 2, inputUsd: 0.88, outputUsd: 0.88,
    useCases: ['Scale', 'Fine-tunes'], contextLength: 128000,
    capabilities: ['chat'], category: 'open-source', isOpenSource: true,
    trust: trust(82, 81, 15),
  }),
  m('fireworks-llama', 'fireworks', 'Fireworks', 'fireworks-llama', 'Fireworks Llama 70B', 'Optimized inference', {
    tier: 'standard', inputCredits: 1, outputCredits: 2, inputUsd: 0.9, outputUsd: 0.9,
    useCases: ['Production', 'Low latency'], contextLength: 128000,
    capabilities: ['chat'], latencyMs: 200,
    trust: trust(83, 82, 14),
  }),

  m('kimi-k2.6', 'kimi', 'Kimi', 'kimi-k2.6', 'Kimi K2.6', 'General-purpose Kimi with vision and tools', {
    tier: 'standard', inputCredits: 1, outputCredits: 3, inputUsd: 0.95, outputUsd: 4,
    useCases: ['Chat', 'Tools', 'Vision'], contextLength: 256000,
    capabilities: ['chat', 'vision', 'tool-calling'], tags: ['kimi'],
    hubModelId: 'kimi-k2.6', trust: trust(88, 87, 12),
  }),
  m('kimi-k2.7-code', 'kimi', 'Kimi', 'kimi-k2.7-code', 'Kimi K2.7 Code', 'Kimi coding agent model', {
    tier: 'premium', inputCredits: 2, outputCredits: 5, inputUsd: 0.95, outputUsd: 4,
    useCases: ['Coding agents', 'Repos'], contextLength: 256000,
    capabilities: ['chat', 'code', 'agent', 'tool-calling'], tags: ['kimi', 'coding'],
    hubModelId: 'kimi-k2.7-code', trust: trust(90, 89, 10),
  }),
  m('kimi-k3', 'kimi', 'Kimi', 'kimi-k3', 'Kimi K3', 'Moonshot flagship — 1M context, deep reasoning', {
    tier: 'frontier', inputCredits: 4, outputCredits: 12, inputUsd: 3, outputUsd: 15,
    useCases: ['Long-horizon coding', 'Agents', 'Reasoning'], contextLength: 1000000,
    capabilities: ['chat', 'reasoning', 'code', 'agent', 'vision', 'tool-calling'], tags: ['kimi', 'flagship'],
    certified: true, minPlan: 'power', hubModelId: 'kimi-k3', trust: trust(93, 91, 8),
  }),

  m('claude-sonnet-or', 'openrouter', 'OpenRouter', 'claude-sonnet-or', 'Claude Sonnet (OpenRouter)', 'Claude Sonnet via OpenRouter', {
    tier: 'premium', inputCredits: 3, outputCredits: 9, inputUsd: 3, outputUsd: 15,
    useCases: ['Coding', 'Analysis'], contextLength: 200000,
    capabilities: ['chat', 'agent', 'tool-calling'], tags: ['openrouter'],
    hubModelId: 'claude-sonnet-4', trust: trust(91, 90, 9),
  }),
  m('qwen-or', 'openrouter', 'OpenRouter', 'qwen-or', 'Qwen 2.5 72B (OpenRouter)', 'Alibaba Qwen via OpenRouter', {
    tier: 'standard', inputCredits: 1, outputCredits: 2, inputUsd: 0.35, outputUsd: 0.4,
    useCases: ['Chinese/English', 'Coding'], contextLength: 131072,
    capabilities: ['chat', 'code'], tags: ['openrouter'],
    hubModelId: 'qwen-2.5-72b', trust: trust(84, 83, 14),
  }),
  m('groq-mixtral', 'groq', 'Groq', 'groq-mixtral', 'Groq Mixtral', 'Fast mixture-of-experts', {
    tier: 'standard', inputCredits: 1, outputCredits: 1, inputUsd: 0.24, outputUsd: 0.24,
    useCases: ['Fast inference'], contextLength: 32768,
    capabilities: ['chat'], latencyMs: 100,
    trust: trust(81, 82, 15),
  }),

  m('azure-gpt-4o', 'custom', 'Azure OpenAI', 'azure-gpt-4o', 'Azure OpenAI GPT-4o', 'Enterprise GPT-4o on Azure', {
    tier: 'premium', inputCredits: 3, outputCredits: 9, inputUsd: 5, outputUsd: 15,
    useCases: ['Regulated industries', 'EU data residency'], contextLength: 128000,
    capabilities: ['chat', 'vision', 'agent', 'tool-calling'], category: 'private',
    isEnterprise: true, certified: true, tags: ['azure', 'private'],
    trust: trust(91, 90, 9),
  }),
  m('bedrock-claude', 'custom', 'AWS Bedrock', 'bedrock-claude', 'AWS Bedrock Claude', 'Claude via AWS Bedrock', {
    tier: 'premium', inputCredits: 3, outputCredits: 9,
    useCases: ['AWS-native workloads', 'VPC endpoints'], contextLength: 200000,
    capabilities: ['chat', 'agent', 'reasoning'], category: 'private',
    isEnterprise: true, certified: true, tags: ['bedrock', 'private'],
    trust: trust(92, 91, 8),
  }),
  m('vertex-gemini', 'custom', 'Vertex AI', 'vertex-gemini', 'Vertex AI Gemini', 'Gemini on Google Vertex', {
    tier: 'premium', inputCredits: 3, outputCredits: 8,
    useCases: ['GCP workloads', 'Multimodal enterprise'], contextLength: 1000000,
    capabilities: ['chat', 'vision', 'multimodal'], category: 'private',
    isEnterprise: true, supportsVision: true, tags: ['vertex', 'private'],
    trust: trust(90, 89, 10),
  }),
  m('vllm-local', 'custom', 'vLLM', 'vllm-local', 'vLLM Self-Hosted', 'Self-hosted via vLLM OpenAI API', {
    tier: 'free', inputCredits: 0, outputCredits: 0,
    useCases: ['On-prem inference', 'GPU clusters'], contextLength: 32768,
    capabilities: ['chat'], category: 'open-source', isLocal: true, isOpenSource: true,
    endpoint: 'http://localhost:8000/v1', tags: ['vllm', 'local'],
    trust: trust(78, 76, 16),
  }),
  m('lmstudio-local', 'custom', 'LM Studio', 'lmstudio-local', 'LM Studio Local', 'Desktop models via LM Studio', {
    tier: 'free', inputCredits: 0, outputCredits: 0,
    useCases: ['Offline dev', 'Privacy prototyping'], contextLength: 32768,
    capabilities: ['chat'], category: 'open-source', isLocal: true, isOpenSource: true,
    endpoint: 'http://localhost:1234/v1', tags: ['lmstudio', 'local'],
    trust: trust(77, 75, 17),
  }),
];

export const MODEL_REGISTRY: ModelRecord[] = [...aipassModels(), ...THIRD_PARTY];

export const ROUTING_RULES: import('./types.js').RoutingRule[] = [
  {
    id: 'invoice-ai',
    appId: 'invoice-ai',
    appName: 'Invoice AI',
    defaultModelId: 'aipass-finance',
    fallbackChain: ['aipass-finance', 'claude-sonnet-4', 'gpt-4o', 'gemini-pro'],
    description: 'Finance extraction and AP workflows',
  },
  {
    id: 'supply-chain-ai',
    appId: 'supply-chain-ai',
    appName: 'Supply Chain AI',
    defaultModelId: 'aipass-supply',
    fallbackChain: ['aipass-supply', 'claude-sonnet-4', 'gpt-4o', 'deepseek-v3'],
    description: 'Procurement and sourcing intelligence',
  },
  {
    id: 'compliance-ai',
    appId: 'compliance-ai',
    appName: 'Compliance AI',
    defaultModelId: 'aipass-compliance',
    fallbackChain: ['aipass-compliance', 'claude-opus-4', 'gpt-5', 'gemini-pro'],
    description: 'Regulatory and audit workflows',
  },
  {
    id: 'customer-support-ai',
    appId: 'customer-support-ai',
    appName: 'Customer Support AI',
    defaultModelId: 'aipass-support',
    fallbackChain: ['aipass-support', 'claude-haiku', 'gpt-4o-mini', 'gemini-flash'],
    description: 'Support triage and resolution',
  },
  {
    id: 'playground',
    appId: 'playground',
    appName: 'AI Playground',
    defaultModelId: 'gpt-4o-mini',
    fallbackChain: ['gpt-4o-mini', 'gemini-flash', 'claude-haiku', 'deepseek-free'],
    description: 'General chat playground',
  },
  {
    id: 'agents',
    appId: 'agents',
    appName: 'Agents',
    defaultModelId: 'claude-sonnet-4',
    fallbackChain: ['claude-sonnet-4', 'aipass-enterprise', 'gpt-4o'],
    description: 'Agent planning and tool use',
  },
  {
    id: 'workflows',
    appId: 'workflows',
    appName: 'Workflows',
    defaultModelId: 'gpt-4o',
    fallbackChain: ['gpt-4o', 'aipass-general', 'claude-sonnet-4'],
    description: 'Workflow orchestration',
  },
  {
    id: 'sales-ai',
    appId: 'sales-ai',
    appName: 'Sales AI',
    defaultModelId: 'aipass-enterprise',
    fallbackChain: ['aipass-enterprise', 'gpt-4o', 'claude-sonnet-4'],
    description: 'Revenue operations copilot',
  },
  {
    id: 'content-ai',
    appId: 'content-ai',
    appName: 'Content AI',
    defaultModelId: 'claude-sonnet-4',
    fallbackChain: ['claude-sonnet-4', 'gpt-4o-mini', 'gemini-flash'],
    description: 'Content generation',
  },
  {
    id: 'knowledge',
    appId: 'knowledge',
    appName: 'Knowledge Pipeline',
    defaultModelId: 'gemini-flash',
    fallbackChain: ['gemini-flash', 'gpt-4o-mini', 'deepseek-free'],
    description: 'RAG and embeddings',
  },
];

export class ModelRegistry {
  private readonly models: Map<string, ModelRecord>;

  constructor(entries: ModelRecord[] = MODEL_REGISTRY) {
    this.models = new Map(entries.map((m) => [m.id, m]));
  }

  list(): ModelRecord[] {
    return [...this.models.values()];
  }

  get(id: string): ModelRecord | undefined {
    return this.models.get(id);
  }

  count(): number {
    return this.models.size;
  }

  search(filters: import('./types.js').ModelCatalogFilters = {}): ModelRecord[] {
    let results = this.list();

    if (filters.category) results = results.filter((m) => m.category === filters.category);
    if (filters.providerId) results = results.filter((m) => m.providerId === filters.providerId);
    if (filters.provider) results = results.filter((m) => m.provider.toLowerCase().includes(filters.provider!.toLowerCase()));
    if (filters.capability) results = results.filter((m) => m.capabilities.includes(filters.capability!));
    if (filters.status) results = results.filter((m) => m.status === filters.status);
    if (filters.tier) results = results.filter((m) => m.pricing.tier === filters.tier);
    if (filters.family) results = results.filter((m) => m.family === filters.family);
    if (filters.freeOnly) results = results.filter((m) => m.pricing.tier === 'free');
    if (filters.paidOnly) results = results.filter((m) => m.pricing.tier !== 'free');
    if (filters.enterprise) results = results.filter((m) => m.isEnterprise);
    if (filters.local) results = results.filter((m) => m.isLocal);
    if (filters.openSource) results = results.filter((m) => m.isOpenSource);
    if (filters.certified) results = results.filter((m) => m.certified);
    if (filters.minContext) results = results.filter((m) => m.contextLength >= filters.minContext!);
    if (filters.vision) results = results.filter((m) => m.supportsVision);
    if (filters.voice) results = results.filter((m) => m.supportsVoice);
    if (filters.toolCalling) results = results.filter((m) => m.supportsToolCalling);
    if (filters.useCase) {
      const uc = filters.useCase.toLowerCase();
      results = results.filter((m) => m.useCases.some((u) => u.toLowerCase().includes(uc)));
    }
    if (filters.query) {
      const q = filters.query.toLowerCase();
      results = results.filter(
        (m) =>
          m.displayName.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.provider.toLowerCase().includes(q) ||
          m.tags.some((t) => t.includes(q)) ||
          m.useCases.some((u) => u.toLowerCase().includes(q)),
      );
    }

    return results;
  }

  listByFamily(family: AIPassFamily): ModelRecord[] {
    return this.list().filter((m) => m.family === family);
  }

  getRoutingRule(appId: string): import('./types.js').RoutingRule | undefined {
    return ROUTING_RULES.find((r) => r.appId === appId);
  }
}

export const defaultModelRegistry = new ModelRegistry();
