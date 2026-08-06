<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\User;
use App\Models\WorkspaceGroup;
use App\Services\OrganizationBootstrap;
use App\Services\WorkspaceCapabilityResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrgGovernanceController extends Controller
{
    public function __construct(
        private OrganizationBootstrap $bootstrap,
        private WorkspaceCapabilityResolver $resolver,
    ) {}

    public function capabilities(): JsonResponse
    {
        return response()->json([
            'roles' => WorkspaceCapabilityResolver::ROLE_CAPS,
            'builderEquivalent' => WorkspaceCapabilityResolver::BUILDER_CAPS,
            'adminOnly' => WorkspaceCapabilityResolver::ADMIN_ONLY,
            'catalog' => [
                ['id' => 'agents:create', 'label' => 'Create agents', 'category' => 'agents'],
                ['id' => 'agents:publish', 'label' => 'Publish agents', 'category' => 'agents'],
                ['id' => 'skills:create', 'label' => 'Create skills', 'category' => 'agents'],
                ['id' => 'skills:publish', 'label' => 'Publish skills', 'category' => 'agents'],
                ['id' => 'frames:use', 'label' => 'Use Frames', 'category' => 'agents'],
                ['id' => 'audit:read', 'label' => 'Access audit logs', 'category' => 'governance'],
                ['id' => 'members:manage', 'label' => 'Manage members', 'category' => 'governance'],
                ['id' => 'groups:manage', 'label' => 'Manage groups', 'category' => 'governance'],
                ['id' => 'analytics:read', 'label' => 'View analytics', 'category' => 'governance'],
                ['id' => 'settings:sensitive', 'label' => 'Sensitive settings', 'category' => 'sensitive', 'adminOnly' => true],
                ['id' => 'billing:manage', 'label' => 'Billing', 'category' => 'sensitive', 'adminOnly' => true],
                ['id' => 'connectors:manage', 'label' => 'Connectors', 'category' => 'sensitive', 'adminOnly' => true],
                ['id' => 'it_security:manage', 'label' => 'IT & Security', 'category' => 'sensitive', 'adminOnly' => true],
            ],
        ]);
    }

    public function members(Request $request, string $org): JsonResponse
    {
        $organization = $this->org($org, $request->user());

        $rows = OrganizationMember::query()
            ->with('user')
            ->where('organization_id', $organization->id)
            ->orderBy('created_at')
            ->get()
            ->map(fn (OrganizationMember $m) => $this->serializeMember($m));

        return response()->json(['members' => $rows]);
    }

    public function updateMember(Request $request, string $org, string $userId): JsonResponse
    {
        $organization = $this->org($org, $request->user());
        $this->assertCanManageMembers($request->user(), $organization);

        $data = $request->validate([
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['string', Rule::in(['owner', 'admin', 'manager', 'member', 'viewer', 'auditor'])],
            'status' => ['sometimes', Rule::in(['active', 'invited', 'deactivated'])],
        ]);

        $member = OrganizationMember::query()
            ->where('organization_id', $organization->id)
            ->where('user_id', $userId)
            ->firstOrFail();

        $member->forceFill([
            'roles' => array_values($data['roles']),
            'status' => $data['status'] ?? $member->status,
        ])->save();

        return response()->json(['member' => $this->serializeMember($member->fresh('user'))]);
    }

    public function inviteMember(Request $request, string $org): JsonResponse
    {
        $organization = $this->org($org, $request->user());
        $this->assertCanManageMembers($request->user(), $organization);

        $data = $request->validate([
            'email' => ['required', 'email'],
            'name' => ['nullable', 'string', 'max:120'],
            'roles' => ['sometimes', 'array'],
            'roles.*' => ['string', Rule::in(['owner', 'admin', 'manager', 'member', 'viewer', 'auditor'])],
        ]);

        $user = User::query()->where('email', strtolower($data['email']))->first();
        if ($user === null) {
            $user = User::query()->create([
                'name' => $data['name'] ?: $data['email'],
                'email' => strtolower($data['email']),
                'auth_provider' => 'invite',
            ]);
        }

        $member = OrganizationMember::query()->updateOrCreate(
            [
                'organization_id' => $organization->id,
                'user_id' => $user->id,
            ],
            [
                'roles' => $data['roles'] ?? ['member'],
                'status' => 'invited',
                'invited_at' => now(),
            ],
        );

        return response()->json(['member' => $this->serializeMember($member->load('user'))], 201);
    }

    public function groups(Request $request, string $org): JsonResponse
    {
        $organization = $this->org($org, $request->user());

        $groups = WorkspaceGroup::query()
            ->with('members')
            ->where('organization_id', $organization->id)
            ->orderBy('name')
            ->get()
            ->map(fn (WorkspaceGroup $g) => $this->serializeGroup($g));

        return response()->json(['groups' => $groups]);
    }

    public function createGroup(Request $request, string $org): JsonResponse
    {
        $organization = $this->org($org, $request->user());
        $this->assertCanManageGroups($request->user(), $organization);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:500'],
            'capabilities' => ['sometimes', 'array'],
            'capabilities.*' => ['string'],
        ]);

        $group = WorkspaceGroup::query()->create([
            'organization_id' => $organization->id,
            'name' => $data['name'],
            'slug' => $this->bootstrap->slugify($data['name']),
            'description' => $data['description'] ?? null,
            'source' => 'manual',
            'capabilities' => $data['capabilities'] ?? [],
        ]);

        return response()->json(['group' => $this->serializeGroup($group->load('members'))], 201);
    }

    public function updateGroup(Request $request, string $org, string $groupId): JsonResponse
    {
        $organization = $this->org($org, $request->user());
        $this->assertCanManageGroups($request->user(), $organization);

        $group = WorkspaceGroup::query()
            ->where('organization_id', $organization->id)
            ->where('id', $groupId)
            ->firstOrFail();

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:500'],
            'capabilities' => ['sometimes', 'array'],
            'capabilities.*' => ['string'],
            'memberIds' => ['sometimes', 'array'],
            'memberIds.*' => ['uuid'],
        ]);

        if (isset($data['name'])) {
            $group->name = $data['name'];
        }
        if (array_key_exists('description', $data)) {
            $group->description = $data['description'];
        }
        if (isset($data['capabilities'])) {
            $group->capabilities = $data['capabilities'];
        }
        $group->save();

        if (isset($data['memberIds'])) {
            $group->members()->sync($data['memberIds']);
        }

        return response()->json(['group' => $this->serializeGroup($group->fresh('members'))]);
    }

    public function deleteGroup(Request $request, string $org, string $groupId): JsonResponse
    {
        $organization = $this->org($org, $request->user());
        $this->assertCanManageGroups($request->user(), $organization);

        $group = WorkspaceGroup::query()
            ->where('organization_id', $organization->id)
            ->where('id', $groupId)
            ->firstOrFail();

        if ($group->slug === 'builders') {
            return response()->json([
                'message' => 'The builders group cannot be deleted. Adjust members and capabilities instead.',
            ], 422);
        }

        $group->delete();

        return response()->json(['ok' => true]);
    }

    private function org(string $orgIdOrSlug, ?User $user): Organization
    {
        $org = Organization::query()
            ->where(function ($q) use ($orgIdOrSlug) {
                $q->where('id', $orgIdOrSlug)->orWhere('slug', $orgIdOrSlug);
            })
            ->first();

        if ($org === null) {
            $org = $this->bootstrap->ensureDefaultOrganization($user);
        } elseif ($user !== null) {
            $this->bootstrap->ensureMembership($org, $user);
        }

        return $org;
    }

    private function assertCanManageMembers(?User $user, Organization $org): void
    {
        abort_unless($user && $this->userCan($user, $org, 'members:manage'), 403, 'Forbidden');
    }

    private function assertCanManageGroups(?User $user, Organization $org): void
    {
        abort_unless($user && $this->userCan($user, $org, 'groups:manage'), 403, 'Forbidden');
    }

    private function userCan(User $user, Organization $org, string $capability): bool
    {
        $member = OrganizationMember::query()
            ->where('organization_id', $org->id)
            ->where('user_id', $user->id)
            ->first();

        if ($member === null) {
            return false;
        }

        $groups = WorkspaceGroup::query()
            ->with('members')
            ->where('organization_id', $org->id)
            ->get();

        $caps = $this->resolver->resolve($member, $groups);

        return $this->resolver->can($caps, $capability);
    }

    private function serializeMember(OrganizationMember $m): array
    {
        return [
            'userId' => $m->user_id,
            'orgId' => $m->organization_id,
            'email' => $m->user?->email,
            'name' => $m->user?->name,
            'roles' => $m->roles ?? ['member'],
            'legacyBuilder' => (bool) $m->legacy_builder,
            'status' => $m->status,
            'invitedAt' => optional($m->invited_at)->toIso8601String(),
            'lastActiveAt' => optional($m->last_active_at)->toIso8601String(),
        ];
    }

    private function serializeGroup(WorkspaceGroup $g): array
    {
        return [
            'id' => $g->id,
            'orgId' => $g->organization_id,
            'name' => $g->name,
            'slug' => $g->slug,
            'description' => $g->description,
            'source' => $g->source,
            'externalId' => $g->external_id,
            'capabilities' => $g->capabilities ?? [],
            'memberIds' => $g->relationLoaded('members')
                ? $g->members->pluck('id')->values()->all()
                : [],
            'createdAt' => optional($g->created_at)->toIso8601String(),
            'updatedAt' => optional($g->updated_at)->toIso8601String(),
        ];
    }
}
