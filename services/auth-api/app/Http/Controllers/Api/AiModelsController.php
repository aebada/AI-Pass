<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AiProviderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiModelsController extends Controller
{
    public function __construct(private readonly AiProviderService $ai) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user === null) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $tier = 'free';
        $catalog = config('ai.models', []);
        $labels = config('ai.provider_labels', []);
        $models = [];
        foreach ($catalog as $id => $meta) {
            $providerId = $meta['provider'];
            $models[] = [
                'id' => $id,
                'displayName' => $meta['display'],
                'providerId' => $providerId,
                'providerName' => $labels[$providerId] ?? ucfirst($providerId),
                'tier' => $meta['tier'],
                'allowed' => $this->ai->canAccessModel($tier, $meta['tier'], $id),
            ];
        }

        return response()->json([
            'tier' => $tier,
            'creditsRemaining' => (int) config('ai.free_monthly_credits', 500),
            'creditsTotal' => (int) config('ai.free_monthly_credits', 500),
            'requestsToday' => 0,
            'dailyRequestLimit' => (int) config('ai.free_daily_requests', 20),
            'models' => $models,
        ]);
    }
}
