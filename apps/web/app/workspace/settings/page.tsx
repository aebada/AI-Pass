'use client';

import Link from 'next/link';
import { ModuleScaffold } from '../../components/workspace/ModuleScaffold';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import { Card, workspaceTokens } from '@ai-pass/ui';

const SETTINGS_LINKS = [
  { label: 'Membership & plans', href: '/workspace/membership', desc: 'Universal AI membership' },
  { label: 'Providers & models', href: '/workspace/providers', desc: 'Model catalog and BYOK' },
  { label: 'Organization', href: '/workspace/settings/org', desc: 'Teams, departments, RBAC' },
  { label: 'Requirements', href: '/workspace/requirements', desc: 'Business requirements capture' },
  { label: 'Account', href: '/settings', desc: 'Profile and preferences' },
];

export default function SettingsPage() {
  return (
    <WorkspaceLayoutClient title="Settings" subtitle="Account, providers, membership, and team">
      <ModuleScaffold
        title="Settings"
        description="Unified settings for membership, providers, organization, and preferences."
        moduleId="settings"
        icon="⚙"
        status="done"
      >
        <div style={{ display: 'grid', gap: 12 }}>
          {SETTINGS_LINKS.map((link) => (
            <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
              <Card padding="md" variant="default" hover>
                <strong style={{ fontSize: 14, color: workspaceTokens.colors.text }}>{link.label}</strong>
                <p style={{ fontSize: 12, color: workspaceTokens.colors.textMuted, margin: '4px 0 0' }}>{link.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </ModuleScaffold>
    </WorkspaceLayoutClient>
  );
}
