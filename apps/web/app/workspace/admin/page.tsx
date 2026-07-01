'use client';

import { defaultOrganizationService } from '@ai-pass/platform-core';
import { ModuleScaffold } from '../../components/workspace/ModuleScaffold';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import { Card, workspaceTokens } from '@ai-pass/ui';

export default function AdminPage() {
  const org = defaultOrganizationService.getOrganization('org_acme');
  const departments = defaultOrganizationService.listDepartments('org_acme');
  const teams = defaultOrganizationService.listTeams('org_acme');

  return (
    <WorkspaceLayoutClient title="Administration" subtitle="Tenant administration and system configuration">
      <ModuleScaffold
        title="Administration"
        description="Manage organization structure, RBAC, tenant settings, and system configuration."
        moduleId="admin"
        icon="🏛"
        status="stub"
        features={['Org management', 'RBAC', 'Tenant config', 'System audit']}
        actions={[{ label: 'Org settings', href: '/workspace/settings/org', primary: true }]}
      >
        {org && (
          <Card padding="md" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 8px' }}>{org.name}</h3>
            <p style={{ fontSize: 13, color: workspaceTokens.colors.textMuted, margin: 0 }}>
              {org.memberCount} members · Plan: {org.plan}
            </p>
          </Card>
        )}

        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Departments</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
          {departments.map((d) => (
            <Card key={d.id} padding="md">
              <strong style={{ fontSize: 14 }}>{d.name}</strong>
              <p style={{ fontSize: 12, color: workspaceTokens.colors.textMuted, margin: '4px 0 0' }}>{d.memberCount} members</p>
            </Card>
          ))}
        </div>

        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Teams</h3>
        {teams.map((t) => (
          <Card key={t.id} padding="md" style={{ marginBottom: 8 }}>
            <strong style={{ fontSize: 14 }}>{t.name}</strong>
            <p style={{ fontSize: 12, color: workspaceTokens.colors.textMuted, margin: '4px 0 0' }}>{t.memberIds.length} members</p>
          </Card>
        ))}
      </ModuleScaffold>
    </WorkspaceLayoutClient>
  );
}
