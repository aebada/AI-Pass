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
        $models = config('ai.models', []);
        if (! isset($models[$modelId])) {
            throw new RuntimeException("Unknown model: {$modelId}");
        }

        return $models[$modelId];
    }

    public function canAccessModel(string $userTier, string $modelTier, ?string $modelId = null): bool
    {
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
        $resolved = $this->resolveModel($modelId);
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
     */
    public function streamChat(string $modelId, array $messages, callable $onChunk): void
    {
        $resolved = $this->resolveModel($modelId);
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
        $key = config("ai.keys.{$provider}");
        if (! is_string($key) || $key === '') {
            // OpenRouter often backs open-model providers when a direct key is missing.
            $fallback = config('ai.keys.openrouter');
            if (is_string($fallback) && $fallback !== '' && in_array($provider, ['deepseek', 'qwen', 'llama'], true)) {
                return $fallback;
            }

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
        $response = Http::withHeaders($this->openAiHeaders($apiKey, $provider))
            ->timeout(120)
            ->post($url, [
                'model' => $model,
                'messages' => $messages,
            ]);

        if (! $response->successful()) {
            throw new RuntimeException($this->formatProviderError($provider, $model, $response->status(), $response->body()));
        }

        $content = data_get($response->json(), 'choices.0.message.content');
        if (! is_string($content) || $content === '') {
            throw new RuntimeException(ucfirst($provider)." model '{$model}' returned an empty response");
        }

        return $content;
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
        $response = Http::withHeaders($this->openAiHeaders($apiKey, $provider))
            ->withOptions(['stream' => true])
            ->timeout(120)
            ->post($url, [
                'model' => $model,
                'messages' => $messages,
                'stream' => true,
            ]);

        if (! $response->successful()) {
            throw new RuntimeException($this->formatProviderError($provider, $model, $response->status(), $response->body()));
        }

        $body = $response->toPsrResponse()->getBody();
        $buffer = '';
        while (! $body->eof()) {
            $buffer .= $body->read(1024);
            while (($pos = strpos($buffer, "\n")) !== false) {
                $line = trim(substr($buffer, 0, $pos));
                $buffer = substr($buffer, $pos + 1);
                if ($line === '' || ! str_starts_with($line, 'data: ')) {
                    continue;
                }
                $data = substr($line, 6);
                if ($data === '[DONE]') {
                    return;
                }
                $json = json_decode($data, true);
                if (! is_array($json)) {
                    continue;
                }
                $delta = data_get($json, 'choices.0.delta.content');
                if (is_string($delta) && $delta !== '') {
                    $onChunk($delta);
                }
            }
        }
    }

    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     */
    private function chatAnthropic(string $apiKey, string $model, array $messages): string
    {
        [$system, $anthropicMessages] = $this->toAnthropicMessages($messages);
        $payload = [
            'model' => $model,
            'max_tokens' => 4096,
            'messages' => $anthropicMessages,
        ];
        if ($system !== null) {
            $payload['system'] = $system;
        }

        $response = Http::withHeaders([
            'x-api-key' => $apiKey,
            'anthropic-version' => '2023-06-01',
            'content-type' => 'application/json',
        ])->timeout(120)->post('https://api.anthropic.com/v1/messages', $payload);

        if (! $response->successful()) {
            throw new RuntimeException($this->formatProviderError('anthropic', $model, $response->status(), $response->body()));
        }

        $content = data_get($response->json(), 'content.0.text');
        if (! is_string($content) || $content === '') {
            throw new RuntimeException("Anthropic model '{$model}' returned an empty response");
        }

        return $content;
    }

    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     */
    private function streamAnthropic(string $apiKey, string $model, array $messages, callable $onChunk): void
    {
        // Anthropic streaming support varies by SDK; fall back to non-stream for reliability.
        $onChunk($this->chatAnthropic($apiKey, $model, $messages));
    }

    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     * @return array{0: ?string, 1: array<int, array{role: string, content: string}>}
     */
    private function toAnthropicMessages(array $messages): array
    {
        $system = null;
        $out = [];
        foreach ($messages as $message) {
            if (($message['role'] ?? '') === 'system') {
                $system = ($system ? $system."\n" : '').($message['content'] ?? '');
                continue;
            }
            $out[] = [
                'role' => ($message['role'] ?? 'user') === 'assistant' ? 'assistant' : 'user',
                'content' => (string) ($message['content'] ?? ''),
            ];
        }

        return [$system, $out];
    }

    /**
     * @return array<string, string>
     */
    private function openAiHeaders(string $apiKey, string $provider): array
    {
        $headers = [
            'Authorization' => "Bearer {$apiKey}",
            'Content-Type' => 'application/json',
        ];

        if ($provider === 'openrouter') {
            $headers['HTTP-Referer'] = config('app.url', 'https://aipass.space');
            $headers['X-Title'] = 'AI Pass';
        }

        return $headers;
    }

    private function formatProviderError(string $provider, string $model, int $status, string $body): string
    {
        $detail = trim($body);
        $json = json_decode($body, true);
        if (is_array($json)) {
            $detail = (string) (data_get($json, 'error.message')
                ?? data_get($json, 'message')
                ?? data_get($json, 'error')
                ?? $detail);
        }
        if (is_array($detail)) {
            $detail = json_encode($detail) ?: 'Unknown error';
        }
        $detail = mb_substr(trim((string) $detail), 0, 500);

        return ucfirst($provider)." model '{$model}' is unavailable (HTTP {$status})"
            .($detail !== '' ? ": {$detail}" : '');
    }
}
