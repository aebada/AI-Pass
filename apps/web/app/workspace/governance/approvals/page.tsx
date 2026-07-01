'use client';

import { getGovernanceService } from '@ai-pass/governance';
import { ModuleScaffold } from '../../../components/workspace/ModuleScaffold';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { Card, workspaceTokens } from '@ai-pass/ui';
import { GovernanceShell, RiskBadge, StatusBadge } from '../components/GovernanceShell';

export default function ApprovalsPage() {
  const approvals = getGovernanceService().approvals.list();
  const systems = getGovernanceService().inventory.list();
  const systemName = (id: string) => systems.find((s) => s.id === id)?.name ?? id;

  return (
    <WorkspaceLayoutClient title="Approvals" subtitle="Human-in-the-loop review queue, escalation, and exception approvals">
      <ModuleScaffold title="Approval Queue" description="Review pending approvals, escalations, and policy exceptions." moduleId="governance" icon="🏛" status="done">
        <GovernanceShell>
          {approvals.map((a) => (
            <Card key={a.id} padding="md" style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ fontSize: 14 }}>{a.reason}</strong>
                  <p style={{ fontSize: 12, color: workspaceTokens.colors.textMuted, margin: '4px 0' }}>
                    {a.type} · {systemName(a.systemId)} · {a.requestedBy}
                  </p>
                  {a.escalatedTo && <p style={{ fontSize: 12, color: workspaceTokens.colors.warning }}>Escalated to: {a.escalatedTo}</p>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <StatusBadge status={a.status} />
                  <div style={{ marginTop: 4 }}><RiskBadge level={a.priority} /></div>
                </div>
              </div>
            </Card>
          ))}
        </GovernanceShell>
      </ModuleScaffold>
    </WorkspaceLayoutClient>
  );
}
