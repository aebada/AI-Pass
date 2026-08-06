<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AiProviderService;
use App\Services\AutoModelRouter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AiChatController extends Controller
{
    public function __construct(private readonly AiProviderService $ai) {}

    public function chat(Request $request): StreamedResponse|JsonResponse
    {
        $user = $request->user();
        if ($user === null) {
            return response()->json(['error' => 'Sign in to use AI chat.'], 401);
        }

        $modelId = (string) $request->input('modelId', $request->input('model', 'auto-standard'));
        $prompt = (string) $request->input('prompt', $request->input('message', ''));
        $rawMessages = $request->input('messages');

        try {
            $resolved = $this->ai->resolveModel($modelId);
        } catch (RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }

        $userTier = 'free';
        if (! $this->ai->canAccessModel($userTier, $resolved['tier'], $modelId)) {
            return response()->json([
                'error' => "Model \"{$resolved['display']}\" requires a higher plan.",
            ], 403);
        }

        $messages = $this->normalizeMessages($rawMessages, $prompt);
        if ($messages === []) {
            return response()->json(['error' => 'messages, message, or prompt required'], 400);
        }

        $messages = $this->withDateTimeContext($messages);

        $wantStream = $request->boolean('stream')
            || str_contains((string) $request->header('Accept', ''), 'text/event-stream');

        if (! $wantStream) {
            try {
                $result = $this->ai->chatWithRoute($modelId, $messages, $userTier);
                $routed = $result['routed'];

                return response()->json([
                    'reply' => $result['content'],
                    'model' => $routed['model'],
                    'provider' => $routed['provider'],
                    'modelId' => $routed['id'],
                    'displayName' => $routed['display'],
                    'routeReason' => $routed['reason'] ?? null,
                    'autoId' => $routed['autoId'] ?? null,
                ]);
            } catch (RuntimeException $e) {
                return response()->json(['error' => $e->getMessage()], 502);
            }
        }

        return response()->stream(function () use ($modelId, $messages, $userTier): void {
            if (function_exists('apache_setenv')) {
                @apache_setenv('no-gzip', '1');
            }
            @ini_set('zlib.output_compression', '0');
            @ini_set('output_buffering', 'off');
            @ini_set('implicit_flush', '1');
            while (ob_get_level() > 0) {
                ob_end_flush();
            }

            $emit = static function (array $payload): void {
                echo 'data: '.json_encode($payload, JSON_UNESCAPED_UNICODE)."\n\n";
                flush();
            };

            try {
                $exclude = [];
                $lastError = null;
                $routed = null;

                for ($attempt = 0; $attempt < 5; $attempt++) {
                    $resolved = $this->ai->resolveExecutableModel($modelId, $userTier, $exclude);
                    $routed = $resolved;
                    if ($attempt === 0 && isset($resolved['reason'])) {
                        $emit([
                            'type' => 'route',
                            'modelId' => $resolved['id'],
                            'displayName' => $resolved['display'],
                            'provider' => $resolved['provider'],
                            'reason' => $resolved['reason'],
                            'autoId' => $resolved['autoId'] ?? null,
                        ]);
                    }

                    try {
                        $this->ai->streamChat($resolved['id'], $messages, function (string $chunk) use ($emit): void {
                            $emit(['type' => 'text', 'content' => $chunk]);
                        });
                        $emit([
                            'type' => 'done',
                            'model' => $resolved['model'],
                            'provider' => $resolved['provider'],
                            'modelId' => $resolved['id'],
                            'displayName' => $resolved['display'],
                            'routeReason' => $resolved['reason'] ?? null,
                        ]);
                        echo "data: [DONE]\n\n";
                        flush();

                        return;
                    } catch (RuntimeException $e) {
                        $lastError = $e;
                        $exclude[] = $resolved['id'];
                        if (! AutoModelRouter::isAuto($modelId)) {
                            throw $e;
                        }
                        $emit([
                            'type' => 'failover',
                            'from' => $resolved['id'],
                            'error' => $e->getMessage(),
                        ]);
                    }
                }

                throw $lastError ?? new RuntimeException('All auto-route providers failed');
            } catch (RuntimeException $e) {
                $emit(['type' => 'error', 'error' => $e->getMessage()]);
            }
        }, 200, [
            'Content-Type' => 'text/event-stream; charset=utf-8',
            'Cache-Control' => 'no-cache, no-transform',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    /**
     * @return array<int, array{role: string, content: string}>
     */
    private function normalizeMessages(mixed $rawMessages, string $prompt): array
    {
        if (is_array($rawMessages) && $rawMessages !== []) {
            $out = [];
            foreach ($rawMessages as $msg) {
                if (! is_array($msg)) {
                    continue;
                }
                $role = (string) ($msg['role'] ?? 'user');
                $content = (string) ($msg['content'] ?? '');
                if ($content === '') {
                    continue;
                }
                $out[] = ['role' => $role, 'content' => $content];
            }

            return $out;
        }

        if (trim($prompt) === '') {
            return [];
        }

        return [['role' => 'user', 'content' => $prompt]];
    }

    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     * @return array<int, array{role: string, content: string}>
     */
    private function withDateTimeContext(array $messages): array
    {
        $today = now()->toFormattedDateString();
        $system = "Today's date is {$today}. Use this when answering time-sensitive questions.";

        if (($messages[0]['role'] ?? null) === 'system') {
            $messages[0]['content'] = $system."\n\n".$messages[0]['content'];

            return $messages;
        }

        array_unshift($messages, ['role' => 'system', 'content' => $system]);

        return $messages;
    }
}
