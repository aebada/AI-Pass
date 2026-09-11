'use client';

import { ModuleScaffold } from '../../../components/workspace/ModuleScaffold';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { Card, workspaceTokens } from '@ai-pass/ui';
import { GovernanceShell } from '../components/GovernanceShell';
import { DEFAULT_LIFECYCLE } from '@ai-pass/governance';

export default function GovernanceSettingsPage() {
  return (
    <WorkspaceLayoutClient title="Governance Settings" subtitle="Lifecycle configuration, administration, and integrations">
      <ModuleScaffold title="Settings & Administration" description="Configure governance lifecycle, integrations, and org-wide policy automation." moduleId="governance" icon="🏛" status="done">
        <GovernanceShell>
          <Card padding="md" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Lifecycle workflow</h3>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {DEFAULT_LIFECYCLE.map((stage, i) => (
                <span key={stage} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 4, background: workspaceTokens.colors.border }}>
                  {i + 1}. {stage.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </Card>

          <Card padding="md" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Integrations</h3>
            <ul style={{ fontSize: 13, margin: 0, paddingLeft: 20, color: workspaceTokens.colors.textMuted }}>
              <li>Trust Engine - validation, certification, trust score, revalidation</li>
              <li>LiveSync - event-driven workflow triggers on policy/risk changes</li>
              <li>Provider Hub - model allowlist/blocklist enforcement</li>
              <li>AI Wallet - governance usage credits and audit reports</li>
              <li>Membership - Enterprise unlocks org-wide governance</li>
              <li>Marketplace - install approval gates</li>
            </ul>
          </Card>

          <Card padding="md">
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Enterprise features</h3>
            <p style={{ fontSize: 13, color: workspaceTokens.colors.textMuted, margin: 0 }}>
              Org-wide governance, policy automation, continuous monitoring, private governance policies, and advanced reports require Enterprise membership.
            </p>
          </Card>
        </GovernanceShell>
      </ModuleScaffold>
    </WorkspaceLayoutClient>
  );
}
