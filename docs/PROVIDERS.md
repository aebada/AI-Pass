# AI-Pass Provider Adapters

This document describes the LLM provider adapters implemented in AI-Pass.

## Overview

AI-Pass supports multiple LLM providers through a unified `AIProvider` interface. All providers normalize requests and responses to a consistent format, enabling seamless switching between providers.

## Supported Providers

### Cloud Providers

#### OpenAI
- **Provider ID:** `openai`
- **Models:** GPT-5, GPT-4o, o3-mini, GPT-4o-mini
- **Configuration:** `OPENAI_API_KEY`
- **Documentation:** <https://platform.openai.com>

#### Anthropic (Claude)
- **Provider ID:** `anthropic`
- **Models:** Claude Sonnet 4, Opus 4, Haiku
- **Configuration:** `ANTHROPIC_API_KEY`
- **Documentation:** <https://docs.anthropic.com>

#### Mistral
- **Provider ID:** `mistral`
- **Models:** Mistral Large, Small, Codestral
- **Configuration:** `MISTRAL_API_KEY`
- **Documentation:** <https://docs.mistral.ai>
- **API Endpoint:** `https://api.mistral.ai/v1`

### Local Providers

#### Local (Ollama, LM Studio, etc.)
- **Provider ID:** `local`
- **Models:** Any OpenAI-compatible local model
- **Configuration:** `LOCAL_PROVIDER_URL`
- **Default:** `http://localhost:11434/v1` (Ollama)

Supports:
- Ollama (`http://localhost:11434/v1`)
- LM Studio (`http://localhost:1234/v1`)
- vLLM
- Custom private endpoints

## Usage

### Basic Example

```typescript
import { createProvider } from '@ai-pass/ai-core';
import type { ModelConfig, ChatRequest } from '@ai-pass/ai-core';

// Configure provider
const config: ModelConfig = {
  provider: 'mistral',
  model: 'mistral-large-latest',
  apiKey: process.env.MISTRAL_API_KEY,
};

// Create provider
const provider = createProvider(config);

// Send chat request
const request: ChatRequest = {
  messages: [
    { id: '1', role: 'user', content: 'Hello!', createdAt: Date.now() }
  ],
};

// Stream response
for await (const chunk of provider.chat(request, config)) {
  if (chunk.type === 'text') {
    console.log(chunk.content);
  }
  if (chunk.type === 'error') {
    console.error(chunk.error);
  }
}
```

### Local Provider Example

```typescript
const config: ModelConfig = {
  provider: 'local',
  model: 'llama3.2',
  baseUrl: process.env.LOCAL_PROVIDER_URL || 'http://localhost:11434/v1',
};

const provider = createProvider(config);
```

## Error Handling

All providers normalize errors to a common `StreamChunk` shape:

```typescript
type StreamChunk =
  | { type: 'text'; content: string }
  | { type: 'tool_call'; toolCall: ToolCall }
  | { type: 'done' }
  | { type: 'error'; error: string };
```

Common error scenarios (error strings follow a predictable pattern):

- **Missing API key:**  
  `configuration_error: mistral API key is not configured`
- **Missing base URL (local):**  
  `configuration_error: local baseUrl is not configured for local provider`
- **Timeout:**  
  `timeout: <provider> request timed out`
- **Connection refused (local):**  
  `network_error: local endpoint <url> is unreachable`
- **API error (401, 403, 429, 5xx, etc.):**  
  `authentication_failed`, `authorization_failed`, `rate_limited`, or `provider_unavailable` with HTTP details

The rest of AI-Pass always receives this consistent error structure.

## Configuration

Add to your `.env.local` or `.env.development`:

```env
# Cloud providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
MISTRAL_API_KEY=sk-mis-...

# Local provider
LOCAL_PROVIDER_URL=http://localhost:11434/v1
```

**Security:** Never commit API keys to Git. Add `.env.local` to `.gitignore`.

## Architecture

```text
ProviderHub (gateway)
  ↓
RoutingEngine (selects model)
  ↓
createProvider(config) → AIProvider
  ↓
Provider (OpenAI / Anthropic / Mistral / Local)
  ↓
External API or Local Endpoint
```

## Implementation Details

### MistralProvider

- Uses Mistral’s OpenAI-compatible API
- Supports streaming chat completions and tool calls
- Timeout: 30 seconds
- Endpoint: `https://api.mistral.ai/v1`
- Centralized error handling via `provider-errors.ts`

### LocalProvider

- Configurable endpoint via `LOCAL_PROVIDER_URL`
- Supports any OpenAI-compatible local server (Ollama, LM Studio, vLLM, etc.)
- Timeout: 60 seconds (longer for local inference)
- Enhanced error messages for connection issues
- No API key required (optional)

## Testing

### Automated Tests

```bash
pnpm --filter @ai-pass/ai-core test
```

Covers:
- Missing API key for Mistral → `configuration_error`
- Missing `baseUrl` for Local → `configuration_error`

### Manual Testing

1. **Mistral:**
   ```bash
   export MISTRAL_API_KEY=your_key
   # Use provider with model 'mistral-small-latest'
   ```

2. **Local (Ollama):**
   ```bash
   ollama run llama3.2
   export LOCAL_PROVIDER_URL=http://localhost:11434/v1
   # Use provider with model 'llama3.2'
   ```

## Acceptance Criteria

✅ Request → Provider → Normalized Response  
✅ Provider unavailable → Normalized Error  
✅ Consistent error structure across all providers  
✅ Timeout handling  
✅ Authentication/API key handling  
✅ Model selection support  

## Files

- `packages/reasoning/ai-core/src/providers/openai.ts`
- `packages/reasoning/ai-core/src/providers/anthropic.ts`
- `packages/reasoning/ai-core/src/providers/mistral.ts` (new)
- `packages/reasoning/ai-core/src/providers/local.ts` (new)
- `packages/reasoning/ai-core/src/providers/openai-compatible-base.ts` (shared base)
- `packages/reasoning/ai-core/src/provider-errors.ts` (centralized errors)
- `packages/reasoning/ai-core/src/provider-registry.ts`
- `packages/reasoning/ai-core/src/index.ts`
