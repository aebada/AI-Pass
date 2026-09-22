import { describe, expect, it } from 'vitest';
import { admin, member, owner } from './permissions.js';

const roles = { owner, admin, member };

type RoleName = keyof typeof roles;
type AuthorizeRequest = Parameters<typeof owner.authorize>[0];

const ALL_ROLES: RoleName[] = ['owner', 'admin', 'member'];

interface MatrixEntry {
  resource: string;
  action: string;
  allowed: RoleName[];
}

// One row per cell of the matrix in docs/specs. A role that gains an action it
// should not have fails here rather than in production.
const MATRIX: MatrixEntry[] = [
  { resource: 'organization', action: 'update', allowed: ['owner', 'admin'] },
  { resource: 'organization', action: 'delete', allowed: ['owner'] },

  { resource: 'member', action: 'create', allowed: ['owner', 'admin'] },
  { resource: 'member', action: 'update', allowed: ['owner', 'admin'] },
  { resource: 'member', action: 'delete', allowed: ['owner', 'admin'] },

  { resource: 'invitation', action: 'create', allowed: ['owner', 'admin'] },
  { resource: 'invitation', action: 'cancel', allowed: ['owner', 'admin'] },

  { resource: 'team', action: 'create', allowed: ['owner', 'admin'] },
  { resource: 'team', action: 'update', allowed: ['owner', 'admin'] },
  { resource: 'team', action: 'delete', allowed: ['owner', 'admin'] },

  { resource: 'provider', action: 'configure', allowed: ['owner', 'admin'] },
  { resource: 'provider', action: 'list', allowed: ['owner', 'admin', 'member'] },

  { resource: 'model', action: 'invoke', allowed: ['owner', 'admin', 'member'] },

  { resource: 'apikey', action: 'create', allowed: ['owner', 'admin'] },
  { resource: 'apikey', action: 'revoke', allowed: ['owner', 'admin'] },
  { resource: 'apikey', action: 'list', allowed: ['owner', 'admin'] },

  { resource: 'billing', action: 'view', allowed: ['owner', 'admin'] },
  { resource: 'billing', action: 'manage', allowed: ['owner'] },

  { resource: 'audit', action: 'view', allowed: ['owner', 'admin'] },
];

function can(role: RoleName, resource: string, action: string): boolean {
  return roles[role].authorize({ [resource]: [action] } as AuthorizeRequest).success;
}

describe('organization permission matrix', () => {
  for (const { resource, action, allowed } of MATRIX) {
    for (const role of ALL_ROLES) {
      const expected = allowed.includes(role);

      it(`${role} ${expected ? 'may' : 'may not'} ${action} ${resource}`, () => {
        expect(can(role, resource, action)).toBe(expected);
      });
    }
  }
});

describe('privilege boundaries', () => {
  it('denies a member every action that changes the organization', () => {
    const changing = MATRIX.filter((entry) => !entry.allowed.includes('member'));

    for (const { resource, action } of changing) {
      expect(can('member', resource, action)).toBe(false);
    }
  });

  it('denies an admin the two actions reserved for the owner', () => {
    expect(can('admin', 'organization', 'delete')).toBe(false);
    expect(can('admin', 'billing', 'manage')).toBe(false);
  });

  it('requires every listed action, not just one of them', () => {
    const result = member.authorize({
      model: ['invoke'],
      billing: ['manage'],
    } as AuthorizeRequest);

    expect(result.success).toBe(false);
  });
});
