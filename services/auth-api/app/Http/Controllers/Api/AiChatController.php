<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AiProviderService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class AiChatController extends Controller
{
    public function __construct(private readonly AiProviderService $ai) {}

    public function chat(Request $request): StreamedResponse|\Illuminate\Http\JsonResponse
    {
        $user = $request->user();
        if ($user === null) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $modelId = (string) $request->input('modelId', 'gpt-4o-mini');
        $prompt = $request->input('prompt');
        $messages = $request->input('messages');

        try {
            $resolved = $this->ai->resolveModel($modelId);
        } catch (Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }

        $tier = 'free';
        if (! $this->ai->canAccessModel($tier, $resolved['tier'], $modelId)) {
            return response()->json([
                'error' => "Model \"{$resolved['display']}\" requires a higher plan. Upgrade to unlock.",
            ], 403);
        }

        if (! is_array($messages) || $messages === []) {
            if (! is_string($prompt) || trim($prompt) === '') {
                return response()->json(['error' => 'messages or prompt required'], 400);
            }
            $messages = [['role' => 'user', 'content' => $prompt]];
        }

        $normalized = [];
        foreach ($messages as $message) {
            if (! is_array($message)) {
                continue;
            }
            $normalized[] = [
                'role' => (string) ($message['role'] ?? 'user'),
                'content' => (string) ($message['content'] ?? ''),
            ];
        }

        return response()->stream(function () use ($modelId, $normalized): void {
            try {
                $this->ai->streamChat($modelId, $normalized, function (string $chunk): void {
                    echo 'data: '.json_encode(['type' => 'text', 'content' => $chunk], JSON_UNESCAPED_UNICODE)."\n\n";
                    if (function_exists('ob_flush')) {
                        @ob_flush();
                    }
                    flush();
                });
                echo 'data: '.json_encode(['type' => 'done'])."\n\n";
                echo "data: [DONE]\n\n";
            } catch (Throwable $e) {
                echo 'data: '.json_encode(['type' => 'error', 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE)."\n\n";
                echo "data: [DONE]\n\n";
            }
        }, 200, [
            'Content-Type' => 'text/event-stream; charset=utf-8',
            'Cache-Control' => 'no-cache, no-transform',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}
