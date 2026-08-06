<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\WorkspaceGroup;
use App\Services\OrganizationBootstrap;
use App\Services\WorkspaceCapabilityResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeController extends Controller
{
    public function __construct(
        private OrganizationBootstrap $bootstrap,
        private WorkspaceCapabilityResolver $resolver,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user === null) {
            return response()->json(['authenticated' => false]);
        }

        $org = $this->bootstrap->ensureDefaultOrganization($user);
        $member = $this->bootstrap->ensureMembership($org, $user);

        $groups = WorkspaceGroup::query()
            ->with('members')
            ->where('organization_id', $org->id)
            ->get();

        $groupIds = $groups
            ->filter(fn (WorkspaceGroup $g) => $g->members->contains('id', $user->id))
            ->pluck('id')
            ->values()
            ->all();

        $capabilities = $this->resolver->resolve($member, $groups);

        return response()->json([
            'authenticated' => true,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'name' => $user->name,
                'avatarUrl' => $user->avatar_url,
                'provider' => $user->auth_provider,
                'orgId' => $org->id,
                'orgSlug' => $org->slug,
                'roles' => $member->roles ?? ['member'],
                'groupIds' => $groupIds,
                'capabilities' => $capabilities,
            ],
        ]);
    }
}
