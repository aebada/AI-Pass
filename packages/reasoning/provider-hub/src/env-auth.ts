import type { AuthConfig, HubProviderId } from './types.js';

/** Read platform-managed API keys from server environment (never NEXT_PUBLIC_*). */
export function createManagedAuthFromEnv(): AuthConfig {
  const openrouter = process.env.OPENROUTER_API_KEY;
  const keys: Partial<Record<HubProviderId, string>> = {};

  const set = (id: HubProviderId, value: string | undefined) => {
    if (value) keys[id] = value;
  };

  set('openai', process.env.OPENAI_API_KEY);
  set('anthropic', process.env.ANTHROPIC_API_KEY);
  set('openrouter', openrouter);
  set('gemini', process.env.GOOGLE_GEMINI_API_KEY);
  set('grok', process.env.XAI_GROK_API_KEY);
  set('cerebras', process.env.CEREBRAS_API_KEY);
  set('sambanova', process.env.SAMBANOVA_API_KEY);

  // DeepSeek / Chinese models route through OpenRouter when no direct key is set.
  set('deepseek', process.env.DEEPSEEK_API_KEY ?? openrouter);
  set('qwen', openrouter);
  set('mistral', process.env.MISTRAL_API_KEY ?? openrouter);
  set('llama', openrouter);
  set('groq', process.env.GROQ_API_KEY);
  set('together', process.env.TOGETHER_API_KEY);
  set('fireworks', process.env.FIREWORKS_API_KEY);

  return { mode: 'managed', managedKeys: keys };
}

export function getEnvFreeMonthlyCredits(): number {
  const parsed = Number.parseInt(process.env.FREE_MONTHLY_CREDITS ?? '500', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 500;
}

export function getEnvFreeDailyRequests(): number {
  const parsed = Number.parseInt(process.env.FREE_DAILY_REQUESTS ?? '20', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 20;
}
