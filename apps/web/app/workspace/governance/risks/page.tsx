'use client';

import { getGovernanceService } from '@ai-pass/governance';
import { ModuleScaffold } from '../../../components/workspace/ModuleScaffold';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { Card, workspaceTokens } from '@ai-pass/ui';
import { GovernanceShell, RiskBadge, StatusBadge } from '../components/GovernanceShell';

export default function RisksPage() {
  const risks = getGovernanceService().risks.list();
  const systems = getGovernanceService().inventory.list();
  const systemName = (id: string) => systems.find((s) => s.id === id)?.name ?? id;

  return (
    <WorkspaceLayoutClient title="Risk Register" subtitle="AI risk register - hallucination, bias, privacy, security, and operational risks">
      <ModuleScaffold title="Risk Register" description="Track, mitigate, and review AI risks across all registered systems." moduleId="governance" icon="🏛" status="done">
        <GovernanceShell>
          {risks.map((r) => (
            <Card key={r.id} padding="md" style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ fontSize: 14 }}>{r.title}</strong>
                  <p style={{ fontSize: 12, color: workspaceTokens.colors.textMuted, margin: '4px 0' }}>
                    {r.category} · {systemName(r.systemId)} · Score: {r.score}
                  </p>
                  <p style={{ fontSize: 12, margin: 0 }}>{r.description}</p>
                  {r.mitigationPlan && (
                    <p style={{ fontSize: 12, color: workspaceTokens.colors.accent, marginTop: 8 }}>Mitigation: {r.mitigationPlan}</p>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <RiskBadge level={r.impact} />
                  <div style={{ marginTop: 4 }}><StatusBadge status={r.status} /></div>
                </div>
              </div>
            </Card>
          ))}
        </GovernanceShell>
      </ModuleScaffold>
    </WorkspaceLayoutClient>
  );
}
