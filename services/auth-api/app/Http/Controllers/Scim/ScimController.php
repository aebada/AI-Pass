<?php

namespace App\Http\Controllers\Scim;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\ScimToken;
use App\Models\User;
use App\Models\WorkspaceGroup;
use App\Services\OrganizationBootstrap;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Minimal SCIM 2.0 Users + Groups for IdP provisioning.
 */
class ScimController extends Controller
{
    public function __construct(private OrganizationBootstrap $bootstrap) {}

    public function serviceProviderConfig(): JsonResponse
    {
        return response()->json([
            'schemas' => ['urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig'],
            'patch' => ['supported' => true],
            'bulk' => ['supported' => false, 'maxOperations' => 0, 'maxPayloadSize' => 0],
            'filter' => ['supported' => true, 'maxResults' => 200],
            'changePassword' => ['supported' => false],
            'sort' => ['supported' => false],
            'etag' => ['supported' => false],
            'authenticationSchemes' => [[
                'type' => 'oauthbearertoken',
                'name' => 'OAuth Bearer Token',
                'description' => 'Authentication via SCIM bearer token issued in Settings & Governance',
                'primary' => true,
            ]],
        ]);
    }

    public function schemas(): JsonResponse
    {
        return response()->json([
            'schemas' => ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
            'totalResults' => 2,
            'Resources' => [
                ['id' => 'urn:ietf:params:scim:schemas:core:2.0:User', 'name' => 'User'],
                ['id' => 'urn:ietf:params:scim:schemas:core:2.0:Group', 'name' => 'Group'],
            ],
        ]);
    }

    public function listUsers(Request $request): JsonResponse
    {
        $org = $this->orgFromRequest($request);
        $members = OrganizationMember::query()
            ->with('user')
            ->where('organization_id', $org->id)
            ->get();

        $resources = $members->map(fn (OrganizationMember $m) => $this->userResource($m))->values();

        return $this->listResponse($resources);
    }

    public function getUser(Request $request, string $id): JsonResponse
    {
        $org = $this->orgFromRequest($request);
        $member = OrganizationMember::query()
            ->with('user')
            ->where('organization_id', $org->id)
            ->where('user_id', $id)
            ->firstOrFail();

        return response()->json($this->userResource($member));
    }

    public function createUser(Request $request): JsonResponse
    {
        $org = $this->orgFromRequest($request);
        $email = strtolower((string) data_get($request->all(), 'emails.0.value', $request->input('userName')));
        $name = (string) data_get($request->all(), 'displayName', data_get($request->all(), 'name.formatted', $email));

        abort_if($email === '', 400, 'email required');

        $user = User::query()->where('email', $email)->first();
        if ($user === null) {
            $user = User::query()->create([
                'name' => $name ?: $email,
                'email' => $email,
                'auth_provider' => 'scim',
                'email_verified_at' => now(),
            ]);
        }

        $member = OrganizationMember::query()->updateOrCreate(
            ['organization_id' => $org->id, 'user_id' => $user->id],
            [
                'roles' => ['member'],
                'status' => $request->boolean('active', true) ? 'active' : 'deactivated',
                'invited_at' => now(),
            ],
        );

        return response()->json($this->userResource($member->load('user')), 201);
    }

    public function replaceUser(Request $request, string $id): JsonResponse
    {
        $org = $this->orgFromRequest($request);
        $member = OrganizationMember::query()
            ->with('user')
            ->where('organization_id', $org->id)
            ->where('user_id', $id)
            ->firstOrFail();

        if ($request->has('active')) {
            $member->status = $request->boolean('active') ? 'active' : 'deactivated';
            $member->save();
        }

        $display = data_get($request->all(), 'displayName');
        if (is_string($display) && $display !== '' && $member->user) {
            $member->user->forceFill(['name' => $display])->save();
        }

        return response()->json($this->userResource($member->fresh('user')));
    }

    public function deleteUser(Request $request, string $id): JsonResponse
    {
        $org = $this->orgFromRequest($request);
        $member = OrganizationMember::query()
            ->where('organization_id', $org->id)
            ->where('user_id', $id)
            ->firstOrFail();

        $member->forceFill(['status' => 'deactivated'])->save();

        return response()->json(null, 204);
    }

    public function listGroups(Request $request): JsonResponse
    {
        $org = $this->orgFromRequest($request);
        $groups = WorkspaceGroup::query()
            ->with('members')
            ->where('organization_id', $org->id)
            ->get();

        return $this->listResponse($groups->map(fn (WorkspaceGroup $g) => $this->groupResource($g))->values());
    }

    public function getGroup(Request $request, string $id): JsonResponse
    {
        $org = $this->orgFromRequest($request);
        $group = WorkspaceGroup::query()
            ->with('members')
            ->where('organization_id', $org->id)
            ->where(function ($q) use ($id) {
                $q->where('id', $id)->orWhere('external_id', $id);
            })
            ->firstOrFail();

        return response()->json($this->groupResource($group));
    }

    public function createGroup(Request $request): JsonResponse
    {
        $org = $this->orgFromRequest($request);
        $display = (string) $request->input('displayName', 'SCIM Group');
        $externalId = $request->input('externalId') ?: $request->input('id');

        $group = WorkspaceGroup::query()->create([
            'organization_id' => $org->id,
            'name' => $display,
            'slug' => $this->bootstrap->slugify($display).'-'.Str::lower(Str::random(4)),
            'source' => 'scim',
            'external_id' => is_string($externalId) ? $externalId : null,
            'capabilities' => [],
            'description' => 'Provisioned via SCIM',
        ]);

        $memberIds = collect($request->input('members', []))
            ->pluck('value')
            ->filter()
            ->values()
            ->all();

        if ($memberIds !== []) {
            $group->members()->sync($memberIds);
        }

        return response()->json($this->groupResource($group->load('members')), 201);
    }

    public function replaceGroup(Request $request, string $id): JsonResponse
    {
        $org = $this->orgFromRequest($request);
        $group = WorkspaceGroup::query()
            ->where('organization_id', $org->id)
            ->where(function ($q) use ($id) {
                $q->where('id', $id)->orWhere('external_id', $id);
            })
            ->firstOrFail();

        if ($request->filled('displayName')) {
            $group->name = (string) $request->input('displayName');
        }
        $group->source = 'scim';
        $group->save();

        if ($request->has('members')) {
            $memberIds = collect($request->input('members', []))
                ->pluck('value')
                ->filter()
                ->values()
                ->all();
            $group->members()->sync($memberIds);
        }

        return response()->json($this->groupResource($group->fresh('members')));
    }

    public function deleteGroup(Request $request, string $id): JsonResponse
    {
        $org = $this->orgFromRequest($request);
        $group = WorkspaceGroup::query()
            ->where('organization_id', $org->id)
            ->where(function ($q) use ($id) {
                $q->where('id', $id)->orWhere('external_id', $id);
            })
            ->firstOrFail();

        if ($group->slug === 'builders') {
            return response()->json([
                'schemas' => ['urn:ietf:params:scim:api:messages:2.0:Error'],
                'detail' => 'Cannot delete builders group',
                'status' => '400',
            ], 400);
        }

        $group->delete();

        return response()->json(null, 204);
    }

    private function orgFromRequest(Request $request): Organization
    {
        /** @var ScimToken $token */
        $token = $request->attributes->get('scimToken');
        abort_unless($token instanceof ScimToken, 401);

        $token->forceFill(['last_used_at' => now()])->save();

        return $token->organization;
    }

    private function userResource(OrganizationMember $member): array
    {
        $user = $member->user;

        return [
            'schemas' => ['urn:ietf:params:scim:schemas:core:2.0:User'],
            'id' => $member->user_id,
            'userName' => $user?->email,
            'displayName' => $user?->name,
            'active' => $member->status === 'active',
            'emails' => [[
                'value' => $user?->email,
                'primary' => true,
                'type' => 'work',
            ]],
            'meta' => [
                'resourceType' => 'User',
                'created' => optional($member->created_at)->toIso8601String(),
                'lastModified' => optional($member->updated_at)->toIso8601String(),
            ],
        ];
    }

    private function groupResource(WorkspaceGroup $group): array
    {
        return [
            'schemas' => ['urn:ietf:params:scim:schemas:core:2.0:Group'],
            'id' => $group->id,
            'externalId' => $group->external_id,
            'displayName' => $group->name,
            'members' => $group->relationLoaded('members')
                ? $group->members->map(fn (User $u) => [
                    'value' => $u->id,
                    'display' => $u->email,
                ])->values()->all()
                : [],
            'meta' => [
                'resourceType' => 'Group',
                'created' => optional($group->created_at)->toIso8601String(),
                'lastModified' => optional($group->updated_at)->toIso8601String(),
            ],
        ];
    }

    private function listResponse($resources): JsonResponse
    {
        $list = collect($resources);

        return response()->json([
            'schemas' => ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
            'totalResults' => $list->count(),
            'startIndex' => 1,
            'itemsPerPage' => $list->count(),
            'Resources' => $list->all(),
        ]);
    }
}
