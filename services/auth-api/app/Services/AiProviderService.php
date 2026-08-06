<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class AiProviderService
{
    /**
     * @return array{provider: string, model: string, tier: string, display: string}
     */
    public function resolveModel(string $modelId): array
    {
        if (AutoModelRouter::isAuto($modelId)) {
            return AutoModelRouter::META[$modelId];
        }

        $models = config('ai.models', []);
        if (! isset($models[$modelId])) {
            throw new RuntimeException("Unknown model: {$modelId}");
        }

        return $models[$modelId];
    }

    /**
     * Resolve a concrete provider model, expanding Auto · Fast/Standard/Complex.
     *
     * @return array{id: string, provider: string, model: string, tier: string, display: string, reason?: string, fallbacks?: list<string>, autoId?: string}
     */
    public function resolveExecutableModel(string $modelId, string $userTier = 'free', array $exclude = []): array
    {
        if (AutoModelRouter::isAuto($modelId)) {
            $routed = app(AutoModelRouter::class)->route($modelId, $userTier, $exclude);

            return [
                'id' => $routed['id'],
                'provider' => $routed['meta']['provider'],
                'model' => $routed['meta']['model'],
                'tier' => $routed['meta']['tier'],
                'display' => $routed['meta']['display'],
                'reason' => $routed['reason'],
                'fallbacks' => $routed['fallbacks'],
                'autoId' => $modelId,
            ];
        }

        $meta = $this->resolveModel($modelId);

        return [
            'id' => $modelId,
            'provider' => $meta['provider'],
            'model' => $meta['model'],
            'tier' => $meta['tier'],
            'display' => $meta['display'],
            'fallbacks' => [],
        ];
    }

    public function assertProviderConfigured(string $provider): void
    {
        $this->resolveApiKey($provider);
    }

    public function canAccessModel(string $userTier, string $modelTier, ?string $modelId = null): bool
    {
        if ($modelId !== null && AutoModelRouter::isAuto($modelId)) {
            if ($modelId === 'auto-complex' && $userTier === 'free') {
                return false;
            }
            $freeModelIds = config('ai.free_model_ids', []);
            if (in_array($modelId, $freeModelIds, true)) {
                return true;
            }
            if ($userTier === 'free') {
                return false;
            }
            if ($userTier === 'professional' && $modelTier === 'frontier') {
                return false;
            }

            return true;
        }

        $freeModelIds = config('ai.free_model_ids', []);
        if ($modelId !== null && in_array($modelId, $freeModelIds, true)) {
            return true;
        }

        $allowedTiersByMembership = match ($userTier) {
            'free' => [],
            'professional' => ['free', 'standard', 'premium'],
            'power', 'enterprise' => ['free', 'standard', 'premium', 'frontier'],
            default => [],
        };

        return in_array($modelTier, $allowedTiersByMembership, true);
    }

    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     */
    public function chat(string $modelId, array $messages): string
    {
        $exclude = [];
        $lastError = null;
        $userTier = 'free';

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $resolved = $this->resolveExecutableModel($modelId, $userTier, $exclude);
            try {
                return $this->chatResolved($resolved, $messages);
            } catch (RuntimeException $e) {
                $lastError = $e;
                $exclude[] = $resolved['id'];
                if (! AutoModelRouter::isAuto($modelId)) {
                    // Manual model: try declared fallbacks only once via auto chain empty
                    $fallbacks = $resolved['fallbacks'] ?? [];
                    if ($fallbacks === []) {
                        throw $e;
                    }
                }
            }
        }

        throw $lastError ?? new RuntimeException('All auto-route providers failed');
    }

    /**
     * @param  array{id: string, provider: string, model: string, tier: string, display: string}  $resolved
     * @param  array<int, array{role: string, content: string}>  $messages
     */
    private function chatResolved(array $resolved, array $messages): string
    {
        $provider = $resolved['provider'];
        $apiKey = $this->resolveApiKey($provider);

        if ($provider === 'anthropic') {
            return $this->chatAnthropic($apiKey, $resolved['model'], $messages);
        }

        $baseUrl = config("ai.provider_endpoints.{$provider}");
        if (! $baseUrl) {
            throw new RuntimeException("No endpoint configured for provider: {$provider}");
        }

        return $this->chatOpenAiCompatible(
            "{$baseUrl}/chat/completions",
            $apiKey,
            $resolved['model'],
            $messages,
            $provider,
        );
    }

    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     * @return array{content: string, routed: array}
     */
    public function chatWithRoute(string $modelId, array $messages, string $userTier = 'free'): array
    {
        $exclude = [];
        $lastError = null;
        $routed = null;

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $resolved = $this->resolveExecutableModel($modelId, $userTier, $exclude);
            $routed = $resolved;
            try {
                $content = $this->chatResolved($resolved, $messages);

                return ['content' => $content, 'routed' => $resolved];
            } catch (RuntimeException $e) {
                $lastError = $e;
                $exclude[] = $resolved['id'];
                if (! AutoModelRouter::isAuto($modelId) && ($resolved['fallbacks'] ?? []) === []) {
                    throw $e;
                }
            }
        }

        throw $lastError ?? new RuntimeException('All auto-route providers failed');
    }

    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     */
    public function streamChat(string $modelId, array $messages, callable $onChunk): void
    {
        $exclude = [];
        $lastError = null;
        $userTier = 'free';

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $resolved = $this->resolveExecutableModel($modelId, $userTier, $exclude);
            try {
                $this->streamChatResolved($resolved, $messages, $onChunk);

                return;
            } catch (RuntimeException $e) {
                $lastError = $e;
                $exclude[] = $resolved['id'];
                if (! AutoModelRouter::isAuto($modelId) && ($resolved['fallbacks'] ?? []) === []) {
                    throw $e;
                }
            }
        }

        throw $lastError ?? new RuntimeException('All auto-route providers failed');
    }

    /**
     * @param  array{provider: string, model: string}  $resolved
     * @param  array<int, array{role: string, content: string}>  $messages
     */
    private function streamChatResolved(array $resolved, array $messages, callable $onChunk): void
    {
        $provider = $resolved['provider'];
        $apiKey = $this->resolveApiKey($provider);

        if ($provider === 'anthropic') {
            $this->streamAnthropic($apiKey, $resolved['model'], $messages, $onChunk);

            return;
        }

        $baseUrl = config("ai.provider_endpoints.{$provider}");
        if (! $baseUrl) {
            throw new RuntimeException("No endpoint configured for provider: {$provider}");
        }

        $this->streamOpenAiCompatible(
            "{$baseUrl}/chat/completions",
            $apiKey,
            $resolved['model'],
            $messages,
            $provider,
            $onChunk,
        );
    }

    private function resolveApiKey(string $provider): string
    {
        $keys = config('ai.keys', []);
        $key = $keys[$provider] ?? null;

        if ($provider === 'deepseek' && empty($key)) {
            $key = $keys['openrouter'] ?? null;
        }

        if (in_array($provider, ['qwen', 'llama'], true) && empty($key)) {
            $key = $keys['openrouter'] ?? null;
        }

        if ($provider === 'mistral' && empty($key)) {
            $key = $keys['openrouter'] ?? null;
        }

        if (empty($key)) {
            throw new RuntimeException("API key not configured for provider: {$provider}");
        }

        return $key;
    }

    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     */
    private function chatOpenAiCompatible(
        string $url,
        string $apiKey,
        string $model,
        array $messages,
        string $provider,
    ): string {
        $headers = [
            'Authorization' => 'Bearer '.$apiKey,
            'Content-Type' => 'application/json',
        ];

        if ($provider === 'openrouter') {
            $headers['HTTP-Referer'] = 'https://aipass.space';
            $headers['X-Title'] = 'AI Pass';
        }

        $response = Http::withHeaders($headers)
            ->timeout(120)
            ->post($url, [
                'model' => $model,
                'messages' => $messages,
                'stream' => false,
            ]);

        if ($response->failed()) {
            throw new RuntimeException($this->formatProviderError($provider, $model, $response->status(), $response->body()));
        }

        $content = $response->json('choices.0.message.content');
        if (! is_string($content) || trim($content) === '') {
            throw new RuntimeException('Provider returned an empty response');
        }

        return $content;
    }

    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     */
    private function chatAnthropic(string $apiKey, string $model, array $messages): string
    {
        $system = '';
        $anthropicMessages = [];
        foreach ($messages as $message) {
            if ($message['role'] === 'system') {
                $system .= ($system !== '' ? "\n" : '').$message['content'];
                continue;
            }
            $anthropicMessages[] = [
                'role' => $message['role'] === 'assistant' ? 'assistant' : 'user',
                'content' => $message['content'],
            ];
        }

        $body = [
            'model' => $model,
            'max_tokens' => 4096,
            'messages' => $anthropicMessages,
        ];
        if ($system !== '') {
            $body['system'] = $system;
        }

        $response = Http::withHeaders([
            'x-api-key' => $apiKey,
            'anthropic-version' => '2023-06-01',
            'Content-Type' => 'application/json',
        ])
            ->timeout(120)
            ->post('https://api.anthropic.com/v1/messages', $body);

        if ($response->failed()) {
            throw new RuntimeException($this->formatProviderError('anthropic', $model, $response->status(), $response->body()));
        }

        $text = $response->json('content.0.text');
        if (! is_string($text) || trim($text) === '') {
            throw new RuntimeException('Anthropic returned an empty response');
        }

        return $text;
    }

    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     */
    private function streamOpenAiCompatible(
        string $url,
        string $apiKey,
        string $model,
        array $messages,
        string $provider,
        callable $onChunk,
    ): void {
        $payload = json_encode([
            'model' => $model,
            'messages' => $messages,
            'stream' => true,
        ], JSON_THROW_ON_ERROR);

        $headers = [
            'Content-Type: application/json',
            'Authorization: Bearer '.$apiKey,
        ];

        if ($provider === 'openrouter') {
            $headers[] = 'HTTP-Referer: https://aipass.space';
            $headers[] = 'X-Title: AI Pass';
        }

        $responseBody = '';

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_RETURNTRANSFER => false,
            CURLOPT_TIMEOUT => 120,
            CURLOPT_WRITEFUNCTION => function ($ch, string $data) use ($onChunk, &$responseBody): int {
                $responseBody .= $data;
                foreach (explode("\n", $data) as $line) {
                    $line = trim($line);
                    if (! str_starts_with($line, 'data: ')) {
                        continue;
                    }
                    $json = substr($line, 6);
                    if ($json === '[DONE]') {
                        return strlen($data);
                    }
                    $parsed = json_decode($json, true);
                    if (! is_array($parsed)) {
                        continue;
                    }
                    $delta = $parsed['choices'][0]['delta']['content'] ?? null;
                    if (is_string($delta) && $delta !== '') {
                        $onChunk($delta);
                    }
                }

                return strlen($data);
            },
        ]);

        $ok = curl_exec($ch);
        $error = curl_error($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($ok === false) {
            throw new RuntimeException($error !== '' ? $error : 'Upstream request failed');
        }

        if ($status >= 400) {
            throw new RuntimeException($this->formatProviderError($provider, $model, $status, $responseBody));
        }
    }

    private function formatProviderError(string $provider, string $model, int $status, string $body): string
    {
        $detail = $this->extractProviderErrorMessage($body);
        $label = ucfirst($provider);

        if ($detail !== null) {
            if ($status === 404 && str_contains(strtolower($detail), 'model')) {
                return "{$label} model \"{$model}\" is unavailable (HTTP {$status}): {$detail}";
            }

            return "{$label} returned HTTP {$status}: {$detail}";
        }

        return "{$label} returned HTTP {$status} for model \"{$model}\"";
    }

    private function extractProviderErrorMessage(string $body): ?string
    {
        $body = trim($body);
        if ($body === '') {
            return null;
        }

        $decoded = json_decode($body, true);
        if (is_array($decoded)) {
            $message = $decoded['error']['message'] ?? $decoded['message'] ?? null;
            if (is_string($message) && trim($message) !== '') {
                return trim($message);
            }
        }

        foreach (explode("\n", $body) as $line) {
            $line = trim($line);
            if (! str_starts_with($line, 'data: ')) {
                continue;
            }
            $json = substr($line, 6);
            if ($json === '[DONE]') {
                continue;
            }
            $parsed = json_decode($json, true);
            if (! is_array($parsed)) {
                continue;
            }
            $message = $parsed['error']['message'] ?? $parsed['message'] ?? null;
            if (is_string($message) && trim($message) !== '') {
                return trim($message);
            }
        }

        $snippet = preg_replace('/\s+/', ' ', $body) ?? $body;

        return strlen($snippet) > 240 ? substr($snippet, 0, 240).'…' : $snippet;
    }

    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     */
    private function streamAnthropic(
        string $apiKey,
        string $model,
        array $messages,
        callable $onChunk,
    ): void {
        $system = '';
        $anthropicMessages = [];
        foreach ($messages as $message) {
            if ($message['role'] === 'system') {
                $system .= ($system !== '' ? "\n" : '').$message['content'];
                continue;
            }
            $anthropicMessages[] = [
                'role' => $message['role'] === 'assistant' ? 'assistant' : 'user',
                'content' => $message['content'],
            ];
        }

        $body = [
            'model' => $model,
            'max_tokens' => 4096,
            'messages' => $anthropicMessages,
            'stream' => true,
        ];
        if ($system !== '') {
            $body['system'] = $system;
        }

        $payload = json_encode($body, JSON_THROW_ON_ERROR);

        $responseBody = '';

        $ch = curl_init('https://api.anthropic.com/v1/messages');
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'x-api-key: '.$apiKey,
                'anthropic-version: 2023-06-01',
            ],
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_RETURNTRANSFER => false,
            CURLOPT_TIMEOUT => 120,
            CURLOPT_WRITEFUNCTION => function ($ch, string $data) use ($onChunk, &$responseBody): int {
                $responseBody .= $data;
                foreach (explode("\n", $data) as $line) {
                    $line = trim($line);
                    if (! str_starts_with($line, 'data: ')) {
                        continue;
                    }
                    $json = substr($line, 6);
                    $parsed = json_decode($json, true);
                    if (! is_array($parsed)) {
                        continue;
                    }
                    if (($parsed['type'] ?? '') === 'content_block_delta') {
                        $text = $parsed['delta']['text'] ?? null;
                        if (is_string($text) && $text !== '') {
                            $onChunk($text);
                        }
                    }
                }

                return strlen($data);
            },
        ]);

        $ok = curl_exec($ch);
        $error = curl_error($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($ok === false) {
            throw new RuntimeException($error !== '' ? $error : 'Anthropic request failed');
        }

        if ($status >= 400) {
            throw new RuntimeException($this->formatProviderError('anthropic', $model, $status, $responseBody));
        }
    }
}
