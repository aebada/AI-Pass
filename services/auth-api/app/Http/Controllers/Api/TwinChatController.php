<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AiProviderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class TwinChatController extends Controller
{
    public function __construct(private readonly AiProviderService $ai) {}

    public function chat(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user === null) {
            return response()->json(['error' => ['code' => 'UNAUTHORIZED', 'message' => 'Sign in required']], 401);
        }

        $message = trim((string) $request->input('message', ''));
        if ($message === '') {
            return response()->json(['error' => ['code' => 'BAD_REQUEST', 'message' => 'message required']], 400);
        }

        $history = $request->input('history', []);
        $messages = [
            [
                'role' => 'system',
                'content' => 'You are the user\'s Digital Twin — a concise, helpful personal assistant. '
                    .'Answer calendar, planning, and productivity questions clearly. Keep replies under 300 words.',
            ],
        ];

        if (is_array($history)) {
            foreach ($history as $turn) {
                if (! is_array($turn)) {
                    continue;
                }
                $role = (string) ($turn['role'] ?? '');
                $content = trim((string) ($turn['content'] ?? ''));
                if ($content === '' || ! in_array($role, ['user', 'assistant'], true)) {
                    continue;
                }
                $messages[] = ['role' => $role, 'content' => $content];
            }
        }

        $messages[] = ['role' => 'user', 'content' => $message];

        $modelId = (string) $request->input('model', 'gpt-4o-mini');

        try {
            $reply = $this->ai->chat($modelId, $messages);
        } catch (RuntimeException $e) {
            return response()->json([
                'error' => ['code' => 'PROVIDER_ERROR', 'message' => $e->getMessage()],
            ], 502);
        }

        return response()->json([
            'reply' => trim($reply) !== '' ? trim($reply) : 'Sorry, I could not generate a reply.',
            'messagesRemaining' => 49,
            'suggestedActions' => ['Plan my day', 'Next meeting'],
        ]);
    }
}
