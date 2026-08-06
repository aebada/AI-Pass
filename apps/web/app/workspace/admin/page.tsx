'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { defaultOrganizationService } from '@ai-pass/platform-core';
import { getWorkspaceRbacService, ROLE_LABELS } from '@ai-pass/workspace-rbac';
import { ModuleScaffold } from '../../components/workspace/ModuleScaffold';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import { Card, workspaceTokens } from '@ai-pass/ui';

export default function AdminPage() {
  const org = defaultOrganizationService.getOrganization('org_acme');
  const departments = defaultOrganizationService.listDepartments('org_acme');
  const teams = defaultOrganizationService.listTeams('org_acme');
  const rbac = useMemo(() => getWorkspaceRbacService(), []);
  const members = rbac.listMembers();
  const groups = rbac.listGroups();

  return (
    <WorkspaceLayoutClient title="Administration" subtitle="Members, groups, and org structure for Managers">
      <ModuleScaffold
        title="Administration"
        description="Managers can administer members, groups, and analytics. Billing, connectors, and IT & Security remain with Admins."
        moduleId="admin"
        icon="landmark"
        status="done"
        features={['Members', 'Groups', 'Analytics', 'Org structure']}
        actions={[
          { label: 'People', href: '/workspace/people', primary: true },
          { label: 'Groups', href: '/workspace/people/groups' },
          { label: 'Settings & Governance', href: '/workspace/settings/governance' },
        ]}
      >
        {org && (
          <Card padding="md" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 8px' }}>{org.name}</h3>
            <p style={{ fontSize: 13, color: workspaceTokens.colors.textMuted, margin: 0 }}>
              {members.length} members · {groups.length} groups · Plan: {org.plan}
            </p>
          </Card>
        )}

        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Members snapshot</h3>
        <div style={{ display: 'grid', gap: 8, marginBottom: 24 }}>
          {members.slice(0, 6).map((m) => (
            <Card key={m.userId} padding="md">
              <strong style={{ fontSize: 14 }}>{m.name}</strong>
              <p style={{ fontSize: 12, color: workspaceTokens.colors.textMuted, margin: '4px 0 0' }}>
                {ROLE_LABELS[m.roles[0] ?? 'member']} · {m.status}
              </p>
            </Card>
          ))}
        </div>

        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Groups</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
          {groups.map((g) => (
            <Link key={g.id} href="/workspace/people/groups" style={{ textDecoration: 'none' }}>
              <Card padding="md" hover>
                <strong style={{ fontSize: 14, color: workspaceTokens.colors.text }}>{g.name}</strong>
                <p style={{ fontSize: 12, color: workspaceTokens.colors.textMuted, margin: '4px 0 0' }}>
                  {g.memberIds.length} members · {g.capabilities.length} capabilities
                </p>
              </Card>
            </Link>
          ))}
        </div>

        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Departments</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
          {departments.map((d) => (
            <Card key={d.id} padding="md">
              <strong style={{ fontSize: 14 }}>{d.name}</strong>
              <p style={{ fontSize: 12, color: workspaceTokens.colors.textMuted, margin: '4px 0 0' }}>
                {d.memberCount} members
              </p>
            </Card>
          ))}
        </div>

        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Teams</h3>
        {teams.map((t) => (
          <Card key={t.id} padding="md" style={{ marginBottom: 8 }}>
            <strong style={{ fontSize: 14 }}>{t.name}</strong>
            <p style={{ fontSize: 12, color: workspaceTokens.colors.textMuted, margin: '4px 0 0' }}>
              {t.memberIds.length} members
            </p>
          </Card>
        ))}
      </ModuleScaffold>
    </WorkspaceLayoutClient>
  );
}
