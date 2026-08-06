# Multi-AI Platform Setup

AI Pass routes all playground chat through **server-side** API routes. Provider API keys are read from environment variables at runtime and are **never** exposed to the browser.

## Quick start

1. Copy the example env file:

   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```

2. Paste your keys into `apps/web/.env.local` locally. **Do not commit this file.**

3. Start the Next.js dev server (Node runtime required for AI chat):

   ```bash
   pnpm dev:web
   ```

4. Sign in at `/login` with Google, then open `/workspace/playground`.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | OpenAI GPT models |
| `OPENROUTER_API_KEY` | Claude, DeepSeek, Qwen, and other OpenRouter models |
| `GOOGLE_GEMINI_API_KEY` | Google Gemini (Flash, Pro) |
| `XAI_GROK_API_KEY` | xAI Grok (`gsk_` prefix keys) |
| `CEREBRAS_API_KEY` | Cerebras inference API |
| `SAMBANOVA_API_KEY` | SambaNova Cloud |
| `ANTHROPIC_API_KEY` | Optional direct Claude access (OpenRouter works too) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `NEXTAUTH_URL` / `NEXTAUTH_SECRET` | NextAuth session |
| `FREE_MONTHLY_CREDITS` | Credits granted on first login (default: 500) |
| `FREE_DAILY_REQUESTS` | Daily request cap for free tier (default: 20) |

## Provider consoles

- [OpenAI Platform](https://platform.openai.com/api-keys)
- [OpenRouter](https://openrouter.ai/keys)
- [Google AI Studio](https://aistudio.google.com/apikey)
- [xAI Console](https://console.x.ai/)
- [Cerebras Cloud](https://cloud.cerebras.ai/)
- [SambaNova Cloud](https://cloud.sambanova.ai/)
- [Google Cloud OAuth](https://console.cloud.google.com/apis/credentials)

## Membership & free tier

| Plan | Models | Limits |
|------|--------|--------|
| **Free** | GPT-4o Mini, Gemini Flash, DeepSeek Free | 500 credits/month, 20 requests/day |
| **Professional** | + GPT-4, Claude Sonnet, Gemini Pro, etc. | 5,000 credits/month |
| **Power** | + Grok, Cerebras, SambaNova, frontier models | 25,000 credits/month |
| **Enterprise** | All models + BYOK / private routing | Custom |

New users receive free credits on first Google sign-in via the NextAuth `signIn` callback.

## Security

- **Never commit** `.env.local` or real API keys. `.env.local` is listed in `.gitignore`.
- All provider keys are **server-side only**. Do not prefix them with `NEXT_PUBLIC_`.
- If keys were pasted in chat, email, or committed by mistake, **rotate them immediately** in each provider console.
- The static export (`output: 'export'`) cannot run AI chat — streaming requires the Node.js API routes.

## Architecture

```
Browser (Playground UI)
  → POST /api/v1/ai/chat  (NextAuth session required)
    → Wallet credit check
    → Membership tier / model gate
    → @ai-pass/provider-hub → @ai-pass/ai-core providers
    → SSE stream back to client
```

## Troubleshooting

- **401 Unauthorized** — Sign in with Google first.
- **403 Model locked** — Upgrade membership or pick a free-tier model.
- **402 No credits** — Monthly credits exhausted; wait for period reset or upgrade.
- **429 Daily limit** — Free tier daily request cap reached.
- **Provider errors** — Verify the corresponding env key is set in `.env.local` and restart the dev server.

## Production (static Hostinger + Laravel proxy)

On [aipass.space](https://aipass.space) the Next.js app is a **static export**. AI chat is proxied to Laravel:

```text
Browser → POST /api/v1/ai/chat
  → public_html/.htaccess → laravel-auth/public/index.php
    → AiChatController (session auth)
      → AiProviderService → OpenAI / Anthropic / OpenRouter / …
      → SSE stream back to browser
```

### Server environment (`laravel-auth/.env`)

Set these on Hostinger (never commit real values):

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | GPT-4o Mini and other OpenAI models |
| `OPENROUTER_API_KEY` | DeepSeek Free, Llama, Claude via OpenRouter |
| `GOOGLE_GEMINI_API_KEY` | Gemini Flash / Pro |
| `XAI_GROK_API_KEY` | Grok models |
| `ANTHROPIC_API_KEY` | Direct Claude access (optional) |
| `FREE_MONTHLY_CREDITS` | Credits shown in playground (default 500) |
| `FREE_DAILY_REQUESTS` | Daily cap for free tier (default 20) |

### Deploy steps

1. Add provider keys to `services/auth-api/.env.production` or `.env.deploy-upload` (local only).
2. Deploy Laravel: `./scripts/deploy-hostinger-laravel-auth.sh`
3. Build + deploy static: `./scripts/build-web-static.sh && ./scripts/deploy-ftp.sh`
4. Confirm `.htaccess` includes rules from `docs/apache-laravel-api-proxy.htaccess` (merged in `apps/web/public/.htaccess`).

### Verify

```bash
curl -sS -o /dev/null -w '%{http_code} %{content_type}\n' \
  -X POST https://aipass.space/api/v1/ai/chat \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"hi","modelId":"gpt-4o-mini"}'
```

Expect `401 application/json` when unsigned in (not `404 text/html`). Signed-in browser requests return `text/event-stream`.
