import { createBuildersGroup, migrateBuildersToGroup } from './migrate.js';
import type {
  Capability,
  GovernanceSnapshot,
  ScimConfig,
  WorkspaceGroup,
  WorkspaceMember,
  WorkspaceRole,
} from './types.js';

const STORAGE_KEY = 'aipass.workspace-rbac.v1';

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function seedSnapshot(orgId = 'org_acme'): GovernanceSnapshot {
  const now = new Date().toISOString();
  const members: WorkspaceMember[] = [
    {
      userId: 'user_owner',
      orgId,
      email: 'owner@acme.example',
      name: 'Alex Owner',
      roles: ['owner'],
      invitedAt: now,
      lastActiveAt: now,
      status: 'active',
    },
    {
      userId: 'user_admin',
      orgId,
      email: 'admin@acme.example',
      name: 'Sam Admin',
      roles: ['admin'],
      invitedAt: now,
      status: 'active',
    },
    {
      userId: 'user_manager',
      orgId,
      email: 'manager@acme.example',
      name: 'Morgan Manager',
      roles: ['manager'],
      invitedAt: now,
      status: 'active',
    },
    {
      userId: 'user_builder_legacy',
      orgId,
      email: 'builder@acme.example',
      name: 'Blake Builder',
      roles: ['member'],
      legacyBuilder: true,
      invitedAt: now,
      status: 'active',
    },
    {
      userId: 'user_member',
      orgId,
      email: 'member@acme.example',
      name: 'Casey Member',
      roles: ['member'],
      invitedAt: now,
      status: 'active',
    },
    {
      userId: 'user_auditor',
      orgId,
      email: 'auditor@acme.example',
      name: 'Avery Auditor',
      roles: ['auditor'],
      invitedAt: now,
      status: 'active',
    },
  ];

  const builders = createBuildersGroup(orgId, []);
  const analysts: WorkspaceGroup = {
    id: uid('grp'),
    orgId,
    name: 'Analytics Readers',
    slug: 'analytics-readers',
    description: 'Can view analytics dashboards',
    source: 'manual',
    capabilities: ['analytics:read'],
    memberIds: ['user_member'],
    createdAt: now,
    updatedAt: now,
  };

  const migrated = migrateBuildersToGroup(members, [builders, analysts], orgId);

  const scim: ScimConfig = {
    orgId,
    enabled: false,
    baseUrl: '/scim/v2',
    tokenHint: undefined,
    lastSyncAt: undefined,
    userCount: 0,
    groupCount: 0,
  };

  return {
    orgId,
    members: migrated.members,
    groups: migrated.groups,
    scim,
  };
}

function readStore(): GovernanceSnapshot | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GovernanceSnapshot;
  } catch {
    return null;
  }
}

function writeStore(data: GovernanceSnapshot): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export class WorkspaceRbacService {
  private data: GovernanceSnapshot;

  constructor(orgId = 'org_acme') {
    this.data = readStore() ?? seedSnapshot(orgId);
    writeStore(this.data);
  }

  getSnapshot(): GovernanceSnapshot {
    return structuredClone(this.data);
  }

  listMembers(): WorkspaceMember[] {
    return [...this.data.members];
  }

  listGroups(): WorkspaceGroup[] {
    return [...this.data.groups];
  }

  getScim(): ScimConfig | undefined {
    return this.data.scim ? { ...this.data.scim } : undefined;
  }

  createGroup(input: {
    name: string;
    description?: string;
    capabilities?: Capability[];
  }): WorkspaceGroup {
    const slug = input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const now = new Date().toISOString();
    const group: WorkspaceGroup = {
      id: uid('grp'),
      orgId: this.data.orgId,
      name: input.name.trim(),
      slug: slug || uid('group'),
      description: input.description,
      source: 'manual',
      capabilities: input.capabilities ?? [],
      memberIds: [],
      createdAt: now,
      updatedAt: now,
    };
    this.data.groups.push(group);
    writeStore(this.data);
    return group;
  }

  updateGroup(
    groupId: string,
    patch: Partial<Pick<WorkspaceGroup, 'name' | 'description' | 'capabilities' | 'memberIds'>>,
  ): WorkspaceGroup {
    const idx = this.data.groups.findIndex((g) => g.id === groupId);
    if (idx < 0) throw new Error('Group not found');
    const current = this.data.groups[idx]!;
    const updated: WorkspaceGroup = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    this.data.groups[idx] = updated;
    writeStore(this.data);
    return updated;
  }

  deleteGroup(groupId: string): void {
    const group = this.data.groups.find((g) => g.id === groupId);
    if (!group) throw new Error('Group not found');
    if (group.slug === 'builders') {
      throw new Error('The builders group cannot be deleted. Adjust its members and capabilities instead.');
    }
    this.data.groups = this.data.groups.filter((g) => g.id !== groupId);
    writeStore(this.data);
  }

  setMemberRoles(userId: string, roles: WorkspaceRole[]): WorkspaceMember {
    const idx = this.data.members.findIndex((m) => m.userId === userId);
    if (idx < 0) throw new Error('Member not found');
    const updated = { ...this.data.members[idx]!, roles };
    this.data.members[idx] = updated;
    writeStore(this.data);
    return updated;
  }

  inviteMember(input: { email: string; name: string; roles?: WorkspaceRole[] }): WorkspaceMember {
    const member: WorkspaceMember = {
      userId: uid('user'),
      orgId: this.data.orgId,
      email: input.email.trim().toLowerCase(),
      name: input.name.trim() || input.email,
      roles: input.roles?.length ? input.roles : ['member'],
      invitedAt: new Date().toISOString(),
      status: 'invited',
    };
    this.data.members.push(member);
    writeStore(this.data);
    return member;
  }

  enableScim(): ScimConfig & { token?: string } {
    const token = `scim_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
    this.data.scim = {
      orgId: this.data.orgId,
      enabled: true,
      baseUrl: '/scim/v2',
      tokenHint: `${token.slice(0, 8)}…`,
      lastSyncAt: undefined,
      userCount: this.data.members.length,
      groupCount: this.data.groups.filter((g) => g.source === 'scim').length,
    };
    writeStore(this.data);
    return { ...this.data.scim, token };
  }

  disableScim(): ScimConfig {
    this.data.scim = {
      orgId: this.data.orgId,
      enabled: false,
      baseUrl: '/scim/v2',
    };
    writeStore(this.data);
    return { ...this.data.scim };
  }

  resetDemo(): GovernanceSnapshot {
    this.data = seedSnapshot(this.data.orgId);
    writeStore(this.data);
    return this.getSnapshot();
  }
}

let singleton: WorkspaceRbacService | null = null;

export function getWorkspaceRbacService(): WorkspaceRbacService {
  if (!singleton) singleton = new WorkspaceRbacService();
  return singleton;
}
