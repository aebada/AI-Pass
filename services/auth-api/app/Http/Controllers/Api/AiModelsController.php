<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AiProviderService;
use App\Services\AutoModelRouter;
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

        foreach (AutoModelRouter::META as $id => $meta) {
            $models[] = [
                'id' => $id,
                'displayName' => $meta['display'],
                'providerId' => 'auto',
                'providerName' => 'Auto',
                'tier' => $meta['tier'],
                'allowed' => $this->ai->canAccessModel($tier, $meta['tier'], $id),
                'description' => $meta['description'],
                'auto' => true,
            ];
        }

        foreach ($catalog as $id => $meta) {
            $provider = $meta['provider'];
            $models[] = [
                'id' => $id,
                'displayName' => $meta['display'],
                'providerId' => $provider,
                'providerName' => $labels[$provider] ?? ucfirst($provider),
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
