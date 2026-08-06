<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\ScimToken;
use App\Models\User;
use App\Services\OrganizationBootstrap;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScimConfigController extends Controller
{
    public function __construct(private OrganizationBootstrap $bootstrap) {}

    public function show(Request $request, string $org): JsonResponse
    {
        $organization = $this->resolveOrg($org, $request->user());
        $token = ScimToken::query()
            ->where('organization_id', $organization->id)
            ->where('enabled', true)
            ->latest()
            ->first();

        return response()->json([
            'scim' => [
                'orgId' => $organization->id,
                'enabled' => $token !== null,
                'baseUrl' => url('/scim/v2'),
                'tokenHint' => $token?->token_hint,
                'lastUsedAt' => optional($token?->last_used_at)->toIso8601String(),
                'userCount' => $organization->members()->count(),
                'groupCount' => $organization->groups()->where('source', 'scim')->count(),
            ],
        ]);
    }

    public function enable(Request $request, string $org): JsonResponse
    {
        $user = $request->user();
        abort_unless($user, 401);

        $organization = $this->resolveOrg($org, $user);

        // Revoke previous tokens
        ScimToken::query()
            ->where('organization_id', $organization->id)
            ->update(['enabled' => false]);

        $issued = ScimToken::issue($organization, 'primary');

        return response()->json([
            'scim' => [
                'orgId' => $organization->id,
                'enabled' => true,
                'baseUrl' => url('/scim/v2'),
                'tokenHint' => $issued['model']->token_hint,
                'token' => $issued['plain'],
            ],
            'message' => 'Copy this SCIM bearer token now — it will not be shown again.',
        ], 201);
    }

    public function disable(Request $request, string $org): JsonResponse
    {
        $organization = $this->resolveOrg($org, $request->user());

        ScimToken::query()
            ->where('organization_id', $organization->id)
            ->update(['enabled' => false]);

        return response()->json([
            'scim' => [
                'orgId' => $organization->id,
                'enabled' => false,
                'baseUrl' => url('/scim/v2'),
            ],
        ]);
    }

    private function resolveOrg(string $orgIdOrSlug, ?User $user): Organization
    {
        $org = Organization::query()
            ->where(function ($q) use ($orgIdOrSlug) {
                $q->where('id', $orgIdOrSlug)->orWhere('slug', $orgIdOrSlug);
            })
            ->first();

        return $org ?? $this->bootstrap->ensureDefaultOrganization($user);
    }
}
