'use client';

import Link from 'next/link';
import { getGovernanceService } from '@ai-pass/governance';
import { ModuleScaffold } from '../../../components/workspace/ModuleScaffold';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { Card, workspaceTokens } from '@ai-pass/ui';
import { GovernanceShell, RiskBadge, StatusBadge } from '../components/GovernanceShell';

export default function InventoryPage() {
  const systems = getGovernanceService().inventory.list();

  return (
    <WorkspaceLayoutClient title="AI Inventory" subtitle="Registered AI systems, agents, models, and workflows">
      <ModuleScaffold title="AI Inventory" description="Central registry of all AI systems with ownership, risk, and compliance status." moduleId="governance" icon="🏛" status="done">
        <GovernanceShell>
          <p style={{ fontSize: 13, color: workspaceTokens.colors.textMuted, marginBottom: 16 }}>{systems.length} systems registered</p>
          {systems.map((s) => (
            <Card key={s.id} padding="md" style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Link href={`/workspace/governance/inventory/${s.id}`} style={{ fontSize: 14, fontWeight: 600, color: workspaceTokens.colors.text, textDecoration: 'none' }}>
                    {s.name}
                  </Link>
                  <p style={{ fontSize: 12, color: workspaceTokens.colors.textMuted, margin: '4px 0' }}>
                    {s.type} · v{s.version} · {s.department} · {s.provider}
                  </p>
                  <p style={{ fontSize: 12, color: workspaceTokens.colors.textMuted, margin: 0 }}>{s.businessPurpose}</p>
                </div>
                <div style={{ textAlign: 'right', minWidth: 100 }}>
                  <RiskBadge level={s.riskClassification} />
                  <div style={{ marginTop: 4 }}><StatusBadge status={s.complianceStatus} /></div>
                  {s.certificationStatus && (
                    <div style={{ fontSize: 11, marginTop: 4, color: workspaceTokens.colors.success }}>{s.certificationStatus} certified</div>
                  )}
                  {s.trustScore !== undefined && (
                    <div style={{ fontSize: 11, marginTop: 2 }}>Trust: {s.trustScore}</div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </GovernanceShell>
      </ModuleScaffold>
    </WorkspaceLayoutClient>
  );
}
