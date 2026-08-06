<?php

namespace App\Services;

/**
 * Fast / Standard / Complex auto routing — best performance-to-price with failover.
 */
class AutoModelRouter
{
    public const IDS = [
        'auto-fast' => 'fast',
        'auto-standard' => 'standard',
        'auto-complex' => 'complex',
    ];

    public const META = [
        'auto-fast' => [
            'provider' => 'auto',
            'model' => 'auto-fast',
            'tier' => 'standard',
            'display' => 'Auto · Fast',
            'description' => 'Lowest latency with strong value — routes to the best cheap/fast model available now.',
        ],
        'auto-standard' => [
            'provider' => 'auto',
            'model' => 'auto-standard',
            'tier' => 'standard',
            'display' => 'Auto · Standard',
            'description' => 'Best performance-to-price tradeoff at this moment, with live failover.',
        ],
        'auto-complex' => [
            'provider' => 'auto',
            'model' => 'auto-complex',
            'tier' => 'premium',
            'display' => 'Auto · Complex',
            'description' => 'Favors frontier capability for hard tasks while still optimizing cost and availability.',
        ],
    ];

    public static function isAuto(string $modelId): bool
    {
        return isset(self::IDS[$modelId]);
    }

    /**
     * @return list<string>
     */
    public function candidatePool(string $complexity): array
    {
        $catalog = config('ai.models', []);
        $keys = array_keys($catalog);

        return match ($complexity) {
            'fast' => array_values(array_filter($keys, fn ($id) => in_array($id, [
                'gpt-4o-mini', 'gpt-5.6-luna', 'gemini-flash', 'gemini-3.6-flash',
                'kimi-k2.6', 'claude-haiku', 'groq-llama-70b', 'deepseek-free', 'mistral-small',
            ], true))),
            'complex' => array_values(array_filter($keys, fn ($id) => in_array($id, [
                'gpt-5.6-sol', 'gpt-5.6-terra', 'claude-opus-5', 'claude-sonnet-5',
                'kimi-k3', 'kimi-k2.7-code', 'gemini-3.1-pro', 'grok-4.5', 'o3-mini',
            ], true))),
            default => array_values(array_filter($keys, fn ($id) => ! str_starts_with($id, 'auto-'))),
        };
    }

    /**
     * @param  list<string>  $exclude
     * @return array{id: string, meta: array{provider: string, model: string, tier: string, display: string}, reason: string, fallbacks: list<string>}
     */
    public function route(string $autoId, string $userTier = 'free', array $exclude = []): array
    {
        if (! self::isAuto($autoId)) {
            throw new \RuntimeException("Not an auto model: {$autoId}");
        }

        $complexity = self::IDS[$autoId];
        $catalog = config('ai.models', []);
        $ai = app(AiProviderService::class);
        $pool = $this->candidatePool($complexity);

        $scored = [];
        foreach ($pool as $id) {
            if (in_array($id, $exclude, true) || self::isAuto($id)) {
                continue;
            }
            $meta = $catalog[$id] ?? null;
            if ($meta === null) {
                continue;
            }
            if (! $ai->canAccessModel($userTier, $meta['tier'], $id)) {
                continue;
            }
            // Skip providers without keys
            try {
                $ai->assertProviderConfigured($meta['provider']);
            } catch (\RuntimeException) {
                continue;
            }

            $scored[] = [
                'id' => $id,
                'meta' => $meta,
                'score' => $this->score($meta, $complexity),
            ];
        }

        usort($scored, fn ($a, $b) => $b['score'] <=> $a['score']);

        if ($scored === []) {
            $fallbackId = 'gpt-4o-mini';
            $fallback = $catalog[$fallbackId] ?? reset($catalog);

            return [
                'id' => $fallbackId,
                'meta' => $fallback,
                'reason' => 'Emergency fallback — no configured eligible models',
                'fallbacks' => [],
            ];
        }

        $best = $scored[0];
        $fallbacks = [];
        foreach (array_slice($scored, 1) as $row) {
            if (count($fallbacks) >= 4) {
                break;
            }
            // Prefer cross-provider failover
            if ($row['meta']['provider'] === $best['meta']['provider'] && count($fallbacks) > 0) {
                $hasCross = false;
                foreach ($fallbacks as $fid) {
                    if (($catalog[$fid]['provider'] ?? '') !== $best['meta']['provider']) {
                        $hasCross = true;
                        break;
                    }
                }
                if ($hasCross) {
                    continue;
                }
            }
            $fallbacks[] = $row['id'];
        }

        $label = self::META[$autoId]['display'];

        return [
            'id' => $best['id'],
            'meta' => $best['meta'],
            'reason' => "{$label} routed to {$best['meta']['display']} (best performance-to-price of ".count($scored).' live models)',
            'fallbacks' => $fallbacks,
        ];
    }

    /**
     * @param  array{provider: string, model: string, tier: string, display: string}  $meta
     */
    private function score(array $meta, string $complexity): float
    {
        $tierScore = match ($meta['tier']) {
            'free' => 1.0,
            'standard' => 2.0,
            'premium' => 3.2,
            'frontier' => 4.5,
            default => 1.5,
        };

        // Approximate cost weight from tier (lower is cheaper)
        $cost = match ($meta['tier']) {
            'free' => 0.05,
            'standard' => 0.4,
            'premium' => 2.0,
            'frontier' => 8.0,
            default => 1.0,
        };

        $performance = $tierScore * 12;

        if ($complexity === 'fast') {
            // Prefer standard/free for latency & value
            $performance = ($meta['tier'] === 'frontier' ? 8 : $performance) + ($meta['tier'] === 'standard' || $meta['tier'] === 'free' ? 10 : 0);
            $costWeight = 1.4;
        } elseif ($complexity === 'complex') {
            $performance = $tierScore * 22;
            $costWeight = 0.5;
        } else {
            $costWeight = 1.0;
        }

        return $performance / (1 + $costWeight * log10(1 + $cost * 10));
    }
}
