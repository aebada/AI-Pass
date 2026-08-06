'use client';

import { getGovernanceService } from '@ai-pass/governance';
import { ModuleScaffold } from '../../../components/workspace/ModuleScaffold';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { Card, workspaceTokens } from '@ai-pass/ui';
import { GovernanceShell, StatusBadge } from '../components/GovernanceShell';

export default function PoliciesPage() {
  const policies = getGovernanceService().policies.list();

  return (
    <WorkspaceLayoutClient title="Policy Management" subtitle="Create, version, publish, and retire AI governance policies">
      <ModuleScaffold title="Policy Management" description="AI usage, security, data, approval, prompt, and model selection policies." moduleId="governance" icon="landmark" status="done">
        <GovernanceShell>
          {policies.map((p) => (
            <Card key={p.id} padding="md" style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <strong style={{ fontSize: 14 }}>{p.name}</strong>
                  <p style={{ fontSize: 12, color: workspaceTokens.colors.textMuted, margin: '4px 0' }}>
                    v{p.version} · {p.category.replace(/_/g, ' ')} · {p.rules.length} rules
                  </p>
                  {p.description && <p style={{ fontSize: 12, margin: 0 }}>{p.description}</p>}
                  <p style={{ fontSize: 11, color: workspaceTokens.colors.textMuted, marginTop: 8 }}>
                    Frameworks: {p.frameworks.join(', ')}
                  </p>
                </div>
                <StatusBadge status={p.status} />
              </div>
            </Card>
          ))}
        </GovernanceShell>
      </ModuleScaffold>
    </WorkspaceLayoutClient>
  );
}
