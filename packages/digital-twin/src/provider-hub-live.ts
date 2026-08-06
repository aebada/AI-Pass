const MANAGED_KEY_ENV_VARS = [
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'OPENROUTER_API_KEY',
  'GOOGLE_GEMINI_API_KEY',
  'XAI_GROK_API_KEY',
  'MISTRAL_API_KEY',
  'GROQ_API_KEY',
] as const;

export function isProviderHubLive(): boolean {
  if (process.env.PROVIDER_HUB_LIVE === '1') return true;
  return MANAGED_KEY_ENV_VARS.some((key) => Boolean(process.env[key]));
}
