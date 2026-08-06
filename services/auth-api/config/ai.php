<?php

return [

    'free_monthly_credits' => (int) env('FREE_MONTHLY_CREDITS', 500),

    'free_daily_requests' => (int) env('FREE_DAILY_REQUESTS', 20),

    /*
    |--------------------------------------------------------------------------
    | Provider API keys (server-only — never expose to browser)
    |--------------------------------------------------------------------------
    */
    'keys' => [
        'openai' => env('OPENAI_API_KEY'),
        'anthropic' => env('ANTHROPIC_API_KEY'),
        'openrouter' => env('OPENROUTER_API_KEY'),
        'gemini' => env('GOOGLE_GEMINI_API_KEY') ?: env('GEMINI_API_KEY'),
        'grok' => env('XAI_GROK_API_KEY'),
        'deepseek' => env('DEEPSEEK_API_KEY'),
        'mistral' => env('MISTRAL_API_KEY'),
        'groq' => env('GROQ_API_KEY'),
        'cerebras' => env('CEREBRAS_API_KEY'),
        'sambanova' => env('SAMBANOVA_API_KEY'),
        'kimi' => env('KIMI_API_KEY') ?: env('MOONSHOT_API_KEY'),
    ],

    'provider_labels' => [
        'auto' => 'Auto',
        'openai' => 'OpenAI',
        'anthropic' => 'Anthropic',
        'gemini' => 'Gemini',
        'grok' => 'Grok',
        'openrouter' => 'OpenRouter',
        'deepseek' => 'DeepSeek',
        'mistral' => 'Mistral',
        'groq' => 'Groq',
        'cerebras' => 'Cerebras',
        'sambanova' => 'SambaNova',
        'kimi' => 'Kimi',
        'qwen' => 'Qwen',
        'llama' => 'Llama',
    ],

    /*
    |--------------------------------------------------------------------------
    | Model catalog — latest provider IDs (Jul 2026)
    |--------------------------------------------------------------------------
    */
    'models' => [
        // OpenAI — GPT-5.6 family + durable workhorses
        'gpt-4o-mini' => ['provider' => 'openai', 'model' => 'gpt-4o-mini', 'tier' => 'standard', 'display' => 'GPT-4o Mini'],
        'gpt-4o' => ['provider' => 'openai', 'model' => 'gpt-4o', 'tier' => 'premium', 'display' => 'GPT-4o'],
        'gpt-5.6-luna' => ['provider' => 'openai', 'model' => 'gpt-5.6-luna', 'tier' => 'standard', 'display' => 'GPT-5.6 Luna'],
        'gpt-5.6-terra' => ['provider' => 'openai', 'model' => 'gpt-5.6-terra', 'tier' => 'premium', 'display' => 'GPT-5.6 Terra'],
        'gpt-5.6-sol' => ['provider' => 'openai', 'model' => 'gpt-5.6-sol', 'tier' => 'frontier', 'display' => 'GPT-5.6 Sol'],
        'gpt-5' => ['provider' => 'openai', 'model' => 'gpt-5.6-sol', 'tier' => 'frontier', 'display' => 'GPT-5.6'],
        'o3-mini' => ['provider' => 'openai', 'model' => 'o3-mini', 'tier' => 'premium', 'display' => 'o3-mini'],

        // Anthropic
        'claude-haiku' => ['provider' => 'anthropic', 'model' => 'claude-haiku-4-5-20251001', 'tier' => 'standard', 'display' => 'Claude Haiku 4.5'],
        'claude-sonnet-4' => ['provider' => 'anthropic', 'model' => 'claude-sonnet-4-20250514', 'tier' => 'premium', 'display' => 'Claude Sonnet 4'],
        'claude-sonnet-5' => ['provider' => 'anthropic', 'model' => 'claude-sonnet-5', 'tier' => 'premium', 'display' => 'Claude Sonnet 5'],
        'claude-opus-4' => ['provider' => 'anthropic', 'model' => 'claude-opus-4-20250514', 'tier' => 'frontier', 'display' => 'Claude Opus 4'],
        'claude-opus-5' => ['provider' => 'anthropic', 'model' => 'claude-opus-5', 'tier' => 'frontier', 'display' => 'Claude Opus 5'],

        // Google Gemini
        'gemini-flash' => ['provider' => 'gemini', 'model' => 'gemini-2.5-flash', 'tier' => 'standard', 'display' => 'Gemini 2.5 Flash'],
        'gemini-3.6-flash' => ['provider' => 'gemini', 'model' => 'gemini-3.6-flash', 'tier' => 'standard', 'display' => 'Gemini 3.6 Flash'],
        'gemini-pro' => ['provider' => 'gemini', 'model' => 'gemini-2.5-pro', 'tier' => 'premium', 'display' => 'Gemini 2.5 Pro'],
        'gemini-3.1-pro' => ['provider' => 'gemini', 'model' => 'gemini-3.1-pro-preview', 'tier' => 'frontier', 'display' => 'Gemini 3.1 Pro'],

        // xAI Grok
        'grok-2' => ['provider' => 'grok', 'model' => 'grok-2-latest', 'tier' => 'premium', 'display' => 'Grok 2'],
        'grok-4.3' => ['provider' => 'grok', 'model' => 'grok-4.3', 'tier' => 'premium', 'display' => 'Grok 4.3'],
        'grok-4.5' => ['provider' => 'grok', 'model' => 'grok-4.5', 'tier' => 'frontier', 'display' => 'Grok 4.5'],

        // Kimi / Moonshot (current platform lineup)
        'kimi-k2.6' => ['provider' => 'kimi', 'model' => 'kimi-k2.6', 'tier' => 'standard', 'display' => 'Kimi K2.6'],
        'kimi-k2.7-code' => ['provider' => 'kimi', 'model' => 'kimi-k2.7-code', 'tier' => 'premium', 'display' => 'Kimi K2.7 Code'],
        'kimi-k3' => ['provider' => 'kimi', 'model' => 'kimi-k3', 'tier' => 'frontier', 'display' => 'Kimi K3'],

        // OpenRouter / open models
        'deepseek-free' => ['provider' => 'openrouter', 'model' => 'deepseek/deepseek-chat', 'tier' => 'free', 'display' => 'DeepSeek Free'],
        'deepseek-v3' => ['provider' => 'openrouter', 'model' => 'deepseek/deepseek-chat-v3-0324', 'tier' => 'premium', 'display' => 'DeepSeek V3'],
        'deepseek-r1-free' => ['provider' => 'openrouter', 'model' => 'openrouter/free', 'tier' => 'free', 'display' => 'DeepSeek R1 Free'],
        'claude-sonnet-or' => ['provider' => 'openrouter', 'model' => 'anthropic/claude-sonnet-4', 'tier' => 'premium', 'display' => 'Claude Sonnet (OpenRouter)'],
        'qwen-or' => ['provider' => 'openrouter', 'model' => 'qwen/qwen-2.5-72b-instruct', 'tier' => 'standard', 'display' => 'Qwen 2.5 72B'],
        'llama-3.3-70b' => ['provider' => 'openrouter', 'model' => 'meta-llama/llama-3.3-70b-instruct:free', 'tier' => 'free', 'display' => 'Llama 3.3 70B'],
        'openrouter-auto' => ['provider' => 'openrouter', 'model' => 'openrouter/auto', 'tier' => 'standard', 'display' => 'OpenRouter Auto'],

        'mistral-small' => ['provider' => 'mistral', 'model' => 'mistral-small-latest', 'tier' => 'standard', 'display' => 'Mistral Small'],
        'mistral-large' => ['provider' => 'mistral', 'model' => 'mistral-large-latest', 'tier' => 'premium', 'display' => 'Mistral Large'],
        'groq-llama-70b' => ['provider' => 'groq', 'model' => 'llama-3.3-70b-versatile', 'tier' => 'standard', 'display' => 'Groq Llama 70B'],

        'cerebras-llama' => ['provider' => 'cerebras', 'model' => 'gemma-4-31b', 'tier' => 'standard', 'display' => 'Cerebras Gemma 4 31B'],
        'cerebras-70b' => ['provider' => 'cerebras', 'model' => 'gpt-oss-120b', 'tier' => 'premium', 'display' => 'Cerebras GPT-OSS 120B'],
        'sambanova-llama' => ['provider' => 'sambanova', 'model' => 'Meta-Llama-3.3-70B-Instruct', 'tier' => 'frontier', 'display' => 'SambaNova Llama 3.3 70B'],
        'sambanova-deepseek' => ['provider' => 'sambanova', 'model' => 'DeepSeek-V3.2', 'tier' => 'premium', 'display' => 'SambaNova DeepSeek V3.2'],
    ],

    'free_model_ids' => [
        'auto-fast',
        'auto-standard',
        'gpt-4o-mini',
        'gpt-5.6-luna',
        'gemini-flash',
        'gemini-3.6-flash',
        'kimi-k2.6',
        'deepseek-free',
        'deepseek-r1-free',
        'llama-3.3-70b',
        'groq-llama-70b',
    ],

    'provider_endpoints' => [
        'openai' => 'https://api.openai.com/v1',
        'anthropic' => 'https://api.anthropic.com/v1',
        'openrouter' => 'https://openrouter.ai/api/v1',
        'gemini' => 'https://generativelanguage.googleapis.com/v1beta/openai',
        'grok' => 'https://api.x.ai/v1',
        'deepseek' => 'https://api.deepseek.com/v1',
        'mistral' => 'https://api.mistral.ai/v1',
        'groq' => 'https://api.groq.com/openai/v1',
        'cerebras' => 'https://api.cerebras.ai/v1',
        'sambanova' => 'https://api.sambanova.ai/v1',
        'kimi' => env('KIMI_BASE_URL', 'https://api.moonshot.ai/v1'),
    ],

];
