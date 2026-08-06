'use client';

import Link from 'next/link';
import {
  ADMIN_ONLY_CAPABILITIES,
  CAPABILITY_CATALOG,
  ROLE_CAPABILITIES,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  type WorkspaceRole,
} from '@ai-pass/workspace-rbac';
import { ModuleScaffold } from '../../../components/workspace/ModuleScaffold';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { Card, workspaceTokens } from '@ai-pass/ui';
import styles from './governance.module.css';

const ROLES: WorkspaceRole[] = ['owner', 'admin', 'manager', 'member', 'viewer', 'auditor'];

const LINKS = [
  {
    label: 'People',
    href: '/workspace/people',
    desc: 'Invite members and assign Manager, Admin, or other roles',
  },
  {
    label: 'Groups',
    href: '/workspace/people/groups',
    desc: 'Create groups and assign granular capabilities',
  },
  {
    label: 'SCIM provisioning',
    href: '/workspace/settings/governance/scim',
    desc: 'Provision users and groups from your identity provider',
  },
  {
    label: 'AI Governance',
    href: '/workspace/governance',
    desc: 'AI system inventory, policies, risk, and monitoring',
  },
];

export default function SettingsGovernancePage() {
  return (
    <WorkspaceLayoutClient
      title="Settings & Governance"
      subtitle="Roles, groups, capabilities, and sensitive admin areas"
    >
      <ModuleScaffold
        title="Settings & Governance"
        description="Granular governance permissions for agents, skills, Frames, audit logs, and sensitive settings — managed through groups and roles."
        moduleId="settings-governance"
        icon="scale"
        status="done"
      >
        <div className={styles.intro}>
          <p>
            The <strong>Manager</strong> role delegates day-to-day workspace administration (members, groups,
            analytics) while billing, connectors, and IT & Security stay with dedicated admins.
          </p>
        </div>

        <div className={styles.linkGrid}>
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={styles.linkCard}>
              <Card padding="md" hover>
                <strong style={{ color: workspaceTokens.colors.text }}>{link.label}</strong>
                <p className={styles.muted}>{link.desc}</p>
              </Card>
            </Link>
          ))}
        </div>

        <h3 className={styles.sectionTitle}>Role matrix</h3>
        <div className={styles.matrix}>
          {ROLES.map((role) => {
            const caps = ROLE_CAPABILITIES[role];
            return (
              <Card key={role} padding="md">
                <strong>{ROLE_LABELS[role]}</strong>
                <p className={styles.muted}>{ROLE_DESCRIPTIONS[role]}</p>
                <ul className={styles.capList}>
                  {caps[0] === '*' ? (
                    <li>All capabilities</li>
                  ) : (
                    (caps as string[]).map((c) => <li key={c}>{c}</li>)
                  )}
                </ul>
              </Card>
            );
          })}
        </div>

        <h3 className={styles.sectionTitle}>Admin-only (not available to Managers)</h3>
        <div className={styles.adminOnlyRow}>
          {ADMIN_ONLY_CAPABILITIES.map((id) => {
            const def = CAPABILITY_CATALOG.find((c) => c.id === id);
            return (
              <Card key={id} padding="md">
                <strong>{def?.label ?? id}</strong>
                <p className={styles.muted}>{def?.description}</p>
              </Card>
            );
          })}
        </div>
      </ModuleScaffold>
    </WorkspaceLayoutClient>
  );
}
