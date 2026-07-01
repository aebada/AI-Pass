'use client';

import { getGovernanceService } from '@ai-pass/governance';
import { ModuleScaffold } from '../../../components/workspace/ModuleScaffold';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { Card, workspaceTokens } from '@ai-pass/ui';
import { GovernanceShell, StatusBadge } from '../components/GovernanceShell';

export default function ReportsPage() {
  const gov = getGovernanceService();
  const executive = gov.reporting.generate({ type: 'executive', format: 'json' });
  const mappings = gov.getComplianceMappings();

  return (
    <WorkspaceLayoutClient title="Reports" subtitle="Inventory, risk, compliance, executive summaries, and audit evidence">
      <ModuleScaffold title="Governance Reports" description="Export inventory, risk, policy, compliance, certification, drift, and audit reports." moduleId="governance" icon="🏛" status="done">
        <GovernanceShell>
          <Card padding="md" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Executive summary</h3>
            <pre style={{ fontSize: 12, margin: 0, overflow: 'auto' }}>{JSON.stringify(executive.data, null, 2)}</pre>
          </Card>

          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Compliance framework mappings</h3>
          {mappings.map((m) => (
            <Card key={m.id} padding="md" style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ fontSize: 13 }}>{m.framework} — {m.controlName}</strong>
                  <p style={{ fontSize: 12, color: workspaceTokens.colors.textMuted, margin: '4px 0 0' }}>
                    {m.controlId} · {m.policyIds.length} policies · {m.systemIds.length} systems
                  </p>
                </div>
                <StatusBadge status={m.status} />
              </div>
            </Card>
          ))}

          <p style={{ fontSize: 12, color: workspaceTokens.colors.textMuted, marginTop: 24 }}>
            Export formats (PDF, Excel, JSON, CSV) available via API — stub implementations.
          </p>
        </GovernanceShell>
      </ModuleScaffold>
    </WorkspaceLayoutClient>
  );
}
