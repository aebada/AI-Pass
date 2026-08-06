'use client';

import Link from 'next/link';
import { getGovernanceService } from '@ai-pass/governance';
import { ModuleScaffold } from '../../components/workspace/ModuleScaffold';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import { Card, workspaceTokens } from '@ai-pass/ui';
import { GovernanceShell, StatCard, RiskBadge, StatusBadge } from './components/GovernanceShell';

export default function GovernanceDashboardPage() {
  const dash = getGovernanceService().getDashboard();
  const gov = getGovernanceService();

  return (
    <WorkspaceLayoutClient title="Governance" subtitle="AI governance operations — continuous monitoring and policy enforcement">
      <ModuleScaffold
        title="Governance Operations"
        description="Enterprise operational governance — inventory, risk, policies, approvals, and continuous monitoring."
        moduleId="governance"
        icon="landmark"
        status="done"
        features={['AI inventory', 'Policy enforcement', 'Risk register', 'Approval workflows', 'Continuous monitoring']}
        actions={[
          { label: 'Register system', href: '/workspace/governance/inventory', primary: true },
          { label: 'Trust Center', href: '/workspace/trust' },
        ]}
      >
        <GovernanceShell>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
            <StatCard label="AI Systems" value={dash.systemCount} />
            <StatCard label="High Risk" value={dash.highRiskCount} tone="error" />
            <StatCard label="Pending Approvals" value={dash.pendingApprovals} tone="warning" />
            <StatCard label="Policy Violations" value={dash.activeViolations} tone="error" />
            <StatCard label="Certified" value={dash.certifiedCount} tone="success" />
            <StatCard label="Drift Alerts" value={dash.driftAlerts} tone="warning" />
            <StatCard label="Monitoring Active" value={dash.monitoringActive} tone="success" />
            <StatCard label="Compliance Rate" value={`${dash.complianceRate}%`} tone="success" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <Card padding="md">
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Risk distribution</h3>
              {Object.entries(dash.riskDistribution).map(([level, count]) => (
                <div key={level} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <RiskBadge level={level} />
                  <span>{count}</span>
                </div>
              ))}
            </Card>
            <Card padding="md">
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Quick actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link href="/workspace/governance/approvals" style={{ color: workspaceTokens.colors.accent, fontSize: 13 }}>Review pending approvals →</Link>
                <Link href="/workspace/governance/monitoring" style={{ color: workspaceTokens.colors.accent, fontSize: 13 }}>View active alerts →</Link>
                <Link href="/workspace/governance/policies" style={{ color: workspaceTokens.colors.accent, fontSize: 13 }}>Manage policies →</Link>
                <Link href="/workspace/compliance" style={{ color: workspaceTokens.colors.accent, fontSize: 13 }}>Compliance frameworks →</Link>
              </div>
            </Card>
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>High-risk systems</h3>
          {gov.inventory.list().filter((s) => s.riskClassification === 'high' || s.riskClassification === 'critical').map((s) => (
            <Card key={s.id} padding="md" style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: 14 }}>{s.name}</strong>
                  <p style={{ fontSize: 12, color: workspaceTokens.colors.textMuted, margin: '4px 0 0' }}>
                    {s.department} · {s.type} · {s.provider}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <RiskBadge level={s.riskClassification} />
                  <div style={{ marginTop: 4 }}><StatusBadge status={s.complianceStatus} /></div>
                </div>
              </div>
            </Card>
          ))}

          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '24px 0 12px' }}>Recent monitoring events</h3>
          {dash.recentEvents.map((e) => (
            <Card key={e.id} padding="md" style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: 13 }}>{e.title}</strong>
                <RiskBadge level={e.severity} />
              </div>
              <p style={{ fontSize: 12, color: workspaceTokens.colors.textMuted, margin: '4px 0 0' }}>
                {e.type} · {e.systemId} · {new Date(e.timestamp).toLocaleString()}
              </p>
            </Card>
          ))}
        </GovernanceShell>
      </ModuleScaffold>
    </WorkspaceLayoutClient>
  );
}
