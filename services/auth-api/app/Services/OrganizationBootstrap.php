<?php

namespace App\Services;

use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\User;
use App\Models\WorkspaceGroup;
use Illuminate\Support\Str;

class OrganizationBootstrap
{
    public function ensureDefaultOrganization(?User $user = null): Organization
    {
        $org = Organization::query()->where('slug', 'default')->first();

        if ($org === null) {
            $org = Organization::query()->create([
                'name' => 'Default Organization',
                'slug' => 'default',
                'plan' => 'professional',
            ]);
        }

        $this->ensureBuildersGroup($org);

        if ($user !== null) {
            $this->ensureMembership($org, $user);
        }

        return $org;
    }

    public function ensureBuildersGroup(Organization $org): WorkspaceGroup
    {
        $group = WorkspaceGroup::query()
            ->where('organization_id', $org->id)
            ->where('slug', 'builders')
            ->first();

        if ($group === null) {
            $group = WorkspaceGroup::query()->create([
                'organization_id' => $org->id,
                'name' => 'Builders',
                'slug' => 'builders',
                'description' => 'Former Builder role holders. Review and adjust in People → Groups.',
                'source' => 'manual',
                'capabilities' => WorkspaceCapabilityResolver::BUILDER_CAPS,
            ]);
        }

        return $group;
    }

    public function ensureMembership(Organization $org, User $user): OrganizationMember
    {
        $member = OrganizationMember::query()
            ->where('organization_id', $org->id)
            ->where('user_id', $user->id)
            ->first();

        if ($member !== null) {
            return $this->migrateLegacyBuilder($org, $member);
        }

        $isFirst = ! OrganizationMember::query()->where('organization_id', $org->id)->exists();

        return OrganizationMember::query()->create([
            'organization_id' => $org->id,
            'user_id' => $user->id,
            'roles' => [$isFirst ? 'owner' : 'member'],
            'status' => 'active',
            'invited_at' => now(),
            'last_active_at' => now(),
        ]);
    }

    public function migrateLegacyBuilder(Organization $org, OrganizationMember $member): OrganizationMember
    {
        $roles = $member->roles ?? [];
        $hadBuilder = in_array('builder', $roles, true) || $member->legacy_builder;

        if (! $hadBuilder) {
            return $member;
        }

        $roles = array_values(array_filter($roles, fn ($r) => $r !== 'builder'));
        if ($roles === []) {
            $roles = ['member'];
        }

        $member->forceFill([
            'roles' => $roles,
            'legacy_builder' => false,
        ])->save();

        $builders = $this->ensureBuildersGroup($org);
        $builders->members()->syncWithoutDetaching([$member->user_id]);

        return $member->fresh();
    }

    public function slugify(string $name): string
    {
        $slug = Str::slug($name);

        return $slug !== '' ? $slug : 'group-'.Str::lower(Str::random(6));
    }
}
