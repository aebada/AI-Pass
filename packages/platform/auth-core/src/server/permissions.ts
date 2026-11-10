import { createAccessControl } from 'better-auth/plugins/access';
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from 'better-auth/plugins/organization/access';

// `team` is the workspace. The name comes from the organization plugin, which
// owns the table and enforces these actions on its own routes, so introducing a
// parallel `workspace` resource would leave two names for one thing.
export const statement = {
  ...defaultStatements,
  provider: ['configure', 'list'],
  model: ['invoke'],
  apikey: ['create', 'revoke', 'list'],
  billing: ['view', 'manage'],
  audit: ['view'],
  tool: ['create', 'update', 'list'],
  knowledgeBase: ['create', 'update', 'list', 'archive'],
} as const;

export const ac = createAccessControl(statement);

export const owner = ac.newRole({
  ...ownerAc.statements,
  provider: ['configure', 'list'],
  model: ['invoke'],
  apikey: ['create', 'revoke', 'list'],
  billing: ['view', 'manage'],
  audit: ['view'],
  tool: ['create', 'update', 'list'],
  knowledgeBase: ['create', 'update', 'list', 'archive'],
});

export const admin = ac.newRole({
  ...adminAc.statements,
  provider: ['configure', 'list'],
  model: ['invoke'],
  apikey: ['create', 'revoke', 'list'],
  billing: ['view'],
  audit: ['view'],
  tool: ['create', 'update', 'list'],
  knowledgeBase: ['create', 'update', 'list', 'archive'],
});

export const member = ac.newRole({
  ...memberAc.statements,
  provider: ['list'],
  model: ['invoke'],
  tool: ['list'],
  knowledgeBase: ['list'],
});

export const roles = { owner, admin, member };

export type OrganizationRole = keyof typeof roles;

export function isOrganizationRole(value: string | null | undefined): value is OrganizationRole {
  return value === 'owner' || value === 'admin' || value === 'member';
}
