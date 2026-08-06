/** OrganizationService types — orgs, departments, teams, projects, RBAC */

export type OrgRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer' | 'auditor';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  memberCount: number;
  createdAt: string;
}

export interface Department {
  id: string;
  orgId: string;
  name: string;
  headUserId?: string;
  memberCount: number;
}

export interface Team {
  id: string;
  orgId: string;
  departmentId?: string;
  name: string;
  memberIds: string[];
}

export interface Project {
  id: string;
  orgId: string;
  teamId?: string;
  name: string;
  description?: string;
  status: 'active' | 'archived';
}

export interface RbacAssignment {
  userId: string;
  orgId: string;
  role: OrgRole;
  scope?: { type: 'org' | 'department' | 'team' | 'project'; id: string };
  permissions: string[];
}

export interface OrganizationService {
  getOrganization(orgId: string): Organization | undefined;
  listDepartments(orgId: string): Department[];
  listTeams(orgId: string, departmentId?: string): Team[];
  listProjects(orgId: string, teamId?: string): Project[];
  getUserRoles(userId: string, orgId: string): RbacAssignment[];
  hasPermission(userId: string, orgId: string, permission: string): boolean;
}

const DEMO_ORG: Organization = {
  id: 'org_acme',
  name: 'Acme Corp',
  slug: 'acme',
  plan: 'professional',
  memberCount: 42,
  createdAt: '2024-01-15T00:00:00Z',
};

const DEMO_DEPARTMENTS: Department[] = [
  { id: 'dept_finance', orgId: 'org_acme', name: 'Finance', headUserId: 'user_sarah', memberCount: 8 },
  { id: 'dept_ops', orgId: 'org_acme', name: 'Operations', headUserId: 'user_marcus', memberCount: 15 },
  { id: 'dept_eng', orgId: 'org_acme', name: 'Engineering', headUserId: 'user_jordan', memberCount: 19 },
];

const DEMO_TEAMS: Team[] = [
  { id: 'team_platform', orgId: 'org_acme', departmentId: 'dept_eng', name: 'Platform', memberIds: ['user_jordan'] },
  { id: 'team_ap', orgId: 'org_acme', departmentId: 'dept_finance', name: 'Accounts Payable', memberIds: ['user_sarah'] },
];

const DEMO_PROJECTS: Project[] = [
  { id: 'proj_invoice', orgId: 'org_acme', teamId: 'team_ap', name: 'Invoice Automation', description: 'Invoice AI rollout', status: 'active' },
  { id: 'proj_ai_os', orgId: 'org_acme', teamId: 'team_platform', name: 'AI OS Migration', description: 'Unified workspace adoption', status: 'active' },
];

export class DefaultOrganizationService implements OrganizationService {
  getOrganization(orgId: string): Organization | undefined {
    return orgId === DEMO_ORG.id ? DEMO_ORG : undefined;
  }

  listDepartments(orgId: string): Department[] {
    return DEMO_DEPARTMENTS.filter((d) => d.orgId === orgId);
  }

  listTeams(orgId: string, departmentId?: string): Team[] {
    return DEMO_TEAMS.filter(
      (t) => t.orgId === orgId && (!departmentId || t.departmentId === departmentId),
    );
  }

  listProjects(orgId: string, teamId?: string): Project[] {
    return DEMO_PROJECTS.filter(
      (p) => p.orgId === orgId && (!teamId || p.teamId === teamId),
    );
  }

  getUserRoles(userId: string, orgId: string): RbacAssignment[] {
    if (orgId !== DEMO_ORG.id) return [];
    return [{
      userId,
      orgId,
      role: userId === 'demo-user' ? 'admin' : 'member',
      permissions: ['workspace:read', 'workspace:write', 'agents:run', 'wallet:spend'],
    }];
  }

  hasPermission(userId: string, orgId: string, permission: string): boolean {
    const roles = this.getUserRoles(userId, orgId);
    return roles.some(
      (r) => r.role === 'owner' || r.role === 'admin' || r.permissions.includes(permission),
    );
  }
}

export const defaultOrganizationService = new DefaultOrganizationService();
