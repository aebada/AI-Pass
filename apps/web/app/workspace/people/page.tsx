'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  getWorkspaceRbacService,
  type WorkspaceMember,
  type WorkspaceRole,
} from '@ai-pass/workspace-rbac';
import { ModuleScaffold } from '../../components/workspace/ModuleScaffold';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import { Button, Card, workspaceTokens } from '@ai-pass/ui';
import styles from './people.module.css';

const ROLE_OPTIONS: WorkspaceRole[] = ['owner', 'admin', 'manager', 'member', 'viewer', 'auditor'];

export default function PeoplePage() {
  const svc = useMemo(() => getWorkspaceRbacService(), []);
  const [members, setMembers] = useState<WorkspaceMember[]>(() => svc.listMembers());
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<WorkspaceRole>('member');
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    setMembers(svc.listMembers());
  }

  function invite() {
    setError(null);
    try {
      svc.inviteMember({ email, name, roles: [role] });
      setEmail('');
      setName('');
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invite failed');
    }
  }

  function setRoles(userId: string, roles: WorkspaceRole[]) {
    svc.setMemberRoles(userId, roles);
    refresh();
  }

  return (
    <WorkspaceLayoutClient title="People" subtitle="Members, roles, and group-based governance">
      <ModuleScaffold
        title="People"
        description="Assign workspace roles and manage access through groups. Prefer group capabilities over one-off permissions."
        moduleId="people"
        icon="users"
        status="done"
        features={['Members', 'Manager role', 'Groups', 'SCIM provisioning']}
        actions={[
          { label: 'Groups', href: '/workspace/people/groups', primary: true },
          { label: 'Settings & Governance', href: '/workspace/settings/governance' },
        ]}
      >
        <div className={styles.banner}>
          Groups are the foundation for governance. Create them manually or provision via SCIM, then assign
          capabilities to groups instead of managing permissions one person at a time.
        </div>

        <Card padding="md" className={styles.inviteCard}>
          <h3 className={styles.sectionTitle}>Invite member</h3>
          <div className={styles.inviteRow}>
            <input
              className={styles.input}
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className={styles.input}
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <select
              className={styles.select}
              value={role}
              onChange={(e) => setRole(e.target.value as WorkspaceRole)}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
            <Button variant="primary" onClick={invite} disabled={!email.trim()}>
              Invite
            </Button>
          </div>
          {error && <p className={styles.error}>{error}</p>}
        </Card>

        <h3 className={styles.sectionTitle}>Members</h3>
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span>Name</span>
            <span>Role</span>
            <span>Status</span>
          </div>
          {members.map((m) => (
            <div key={m.userId} className={styles.tableRow}>
              <div>
                <strong>{m.name}</strong>
                <div className={styles.muted}>{m.email}</div>
              </div>
              <select
                className={styles.select}
                value={m.roles[0] ?? 'member'}
                onChange={(e) => setRoles(m.userId, [e.target.value as WorkspaceRole])}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
              <span className={styles.status}>{m.status}</span>
            </div>
          ))}
        </div>

        <h3 className={styles.sectionTitle}>Roles</h3>
        <div className={styles.roleGrid}>
          {ROLE_OPTIONS.map((r) => (
            <Card key={r} padding="md">
              <strong>{ROLE_LABELS[r]}</strong>
              <p className={styles.muted}>{ROLE_DESCRIPTIONS[r]}</p>
            </Card>
          ))}
        </div>

        <p className={styles.footerNote}>
          Former Builders were moved to the{' '}
          <Link href="/workspace/people/groups">builders group</Link> with equivalent permissions.
        </p>
      </ModuleScaffold>
    </WorkspaceLayoutClient>
  );
}
