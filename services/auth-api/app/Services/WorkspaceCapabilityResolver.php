<?php

namespace App\Services;

use App\Models\OrganizationMember;
use App\Models\WorkspaceGroup;
use Illuminate\Support\Collection;

class WorkspaceCapabilityResolver
{
    /** @var list<string> */
    public const ADMIN_ONLY = [
        'settings:sensitive',
        'billing:manage',
        'connectors:manage',
        'it_security:manage',
    ];

    /** @var array<string, list<string>> */
    public const ROLE_CAPS = [
        'owner' => ['*'],
        'admin' => ['*'],
        'manager' => [
            'workspace:read', 'workspace:write', 'playground:use', 'agents:run', 'frames:use',
            'members:manage', 'groups:manage', 'analytics:read', 'audit:read',
        ],
        'member' => ['workspace:read', 'workspace:write', 'playground:use', 'agents:run', 'frames:use'],
        'viewer' => ['workspace:read', 'playground:use'],
        'auditor' => ['workspace:read', 'audit:read', 'trust:audit', 'compliance:approve', 'analytics:read'],
    ];

    public const BUILDER_CAPS = [
        'workspace:read', 'workspace:write', 'playground:use',
        'agents:create', 'agents:publish', 'agents:run',
        'skills:create', 'skills:publish', 'frames:use',
    ];

    /**
     * @param  Collection<int, WorkspaceGroup>  $groups  Groups with members relation loaded
     * @return list<string>
     */
    public function resolve(OrganizationMember $member, Collection $groups): array
    {
        $roles = $member->roles ?? ['member'];

        if (in_array('owner', $roles, true) || in_array('admin', $roles, true)) {
            return ['*'];
        }

        $caps = [];
        foreach ($roles as $role) {
            foreach (self::ROLE_CAPS[$role] ?? [] as $cap) {
                if ($cap === '*') {
                    return ['*'];
                }
                $caps[$cap] = true;
            }
        }

        $isManagerOnly = in_array('manager', $roles, true)
            && ! in_array('admin', $roles, true)
            && ! in_array('owner', $roles, true);

        foreach ($groups as $group) {
            $memberIds = $group->relationLoaded('members')
                ? $group->members->pluck('id')->all()
                : [];

            if (! in_array($member->user_id, $memberIds, true)) {
                continue;
            }

            foreach ($group->capabilities ?? [] as $cap) {
                if ($isManagerOnly && in_array($cap, self::ADMIN_ONLY, true)) {
                    continue;
                }
                $caps[$cap] = true;
            }
        }

        return array_keys($caps);
    }

    /**
     * @param  list<string>  $capabilities
     */
    public function can(array $capabilities, string $capability): bool
    {
        if (in_array('*', $capabilities, true)) {
            return true;
        }
        if (in_array($capability, $capabilities, true)) {
            return true;
        }
        $ns = explode(':', $capability)[0] ?? '';

        return $ns !== '' && in_array($ns.':*', $capabilities, true);
    }
}
