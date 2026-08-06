<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;

/**
 * Server-side gateway to the external AI-Pass ecosystem deployments.
 *
 * This must run server-side: the remote services send no CORS headers and the
 * platform front end is a static export, so a browser cannot call them. The
 * shared API keys also stay on the server and are never sent to the client.
 */
class IntegrationsController extends Controller
{
    /** Liveness for every registered service, probed concurrently. */
    public function index(): JsonResponse
    {
        $services = (array) config('integrations.services', []);

        $responses = Http::pool(fn ($pool) => array_map(
            fn (string $id) => $pool->as($id)
                ->timeout((int) config('integrations.timeout', 8))
                ->acceptJson()
                ->get($services[$id]['base_url'].'/health'),
            array_keys($services),
        ));

        $out = [];

        foreach ($services as $id => $service) {
            $response = $responses[$id] ?? null;
            $out[] = $this->describe($id, $service, $response);
        }

        return response()->json(['integrations' => $out]);
    }

    /** Proxies a whitelisted read endpoint on one service. */
    public function show(string $id, string $endpoint): JsonResponse
    {
        $service = config("integrations.services.{$id}");

        if (! is_array($service)) {
            return response()->json([
                'error' => 'unknown_integration',
                'message' => "No integration registered with id [{$id}].",
            ], 404);
        }

        // Whitelist, not passthrough: the caller must not be able to steer a
        // server-side, key-bearing request at an arbitrary remote path.
        if (! in_array($endpoint, (array) ($service['endpoints'] ?? []), true)) {
            return response()->json([
                'error' => 'unknown_endpoint',
                'message' => "Endpoint [{$endpoint}] is not exposed for [{$id}].",
            ], 404);
        }

        if (blank($service['api_key'] ?? null)) {
            return response()->json([
                'error' => 'not_configured',
                'message' => "No API key configured for [{$id}]. Set it in this service's .env.",
            ], 503);
        }

        try {
            $response = Http::withToken($service['api_key'])
                ->timeout((int) config('integrations.timeout', 8))
                ->acceptJson()
                ->get("{$service['base_url']}/{$endpoint}");
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'error' => 'unreachable',
                'message' => "Could not reach [{$id}].",
            ], 502);
        }

        // Surface the remote's own status rather than flattening failures to 200.
        return response()->json(
            $response->json() ?? ['error' => 'invalid_response'],
            $response->successful() ? 200 : $response->status(),
        );
    }

    /** @param array<string, mixed> $service */
    private function describe(string $id, array $service, $response): array
    {
        $base = [
            'id' => $id,
            'label' => $service['label'] ?? $id,
            'endpoints' => array_values((array) ($service['endpoints'] ?? [])),
            // Which host we actually call — no credentials, and it makes a
            // misconfigured base_url obvious from the dashboard.
            'base_url' => $service['base_url'] ?? null,
            // Whether *this* side holds a key — never the key itself.
            'api_key_configured' => filled($service['api_key'] ?? null),
        ];

        if (! $response || ! $response->successful()) {
            return $base + [
                'reachable' => (bool) $response,
                'status' => $response ? 'degraded' : 'unreachable',
                'http_status' => $response?->status(),
            ];
        }

        $body = (array) $response->json();

        return $base + [
            'reachable' => true,
            'status' => ($body['status'] ?? null) === 'ok' ? 'ok' : 'degraded',
            'http_status' => $response->status(),
            'remote_api_configured' => $body['api_configured'] ?? null,
        ];
    }
}
