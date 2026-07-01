'use client';

import { useParams } from 'next/navigation';
import { getGovernanceService } from '@ai-pass/governance';
import { ModuleScaffold } from '../../../../components/workspace/ModuleScaffold';
import { WorkspaceLayoutClient } from '../../../../components/workspace/WorkspaceLayoutClient';
import { Card, workspaceTokens } from '@ai-pass/ui';
import { GovernanceShell, RiskBadge, StatusBadge } from '../../components/GovernanceShell';

export default function SystemDetailClient() {
  const params = useParams();
  const id = String(params.id ?? '');
  const system = getGovernanceService().inventory.get(id);
  const risks = getGovernanceService().risks.list({ systemId: id });
  const events = getGovernanceService().monitoring.list({ systemId: id });
  const progress = system ? getGovernanceService().workflow.evaluateProgress(system) : [];

  if (!system) {
    return (
      <WorkspaceLayoutClient title="System not found">
        <p>AI system {id} not found.</p>
      </WorkspaceLayoutClient>
    );
  }

  return (
    <WorkspaceLayoutClient title={system.name} subtitle={`${system.type} · ${system.department}`}>
      <ModuleScaffold title={system.name} description={system.businessPurpose} moduleId="governance" icon="🏛" status="done">
        <GovernanceShell>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <Card padding="md">
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Details</h3>
              <dl style={{ fontSize: 13, margin: 0 }}>
                <dt style={{ color: workspaceTokens.colors.textMuted }}>Owner</dt><dd style={{ margin: '0 0 8px' }}>{system.ownerId}</dd>
                <dt style={{ color: workspaceTokens.colors.textMuted }}>Provider</dt><dd style={{ margin: '0 0 8px' }}>{system.provider} v{system.version}</dd>
                <dt style={{ color: workspaceTokens.colors.textMuted }}>Environment</dt><dd style={{ margin: '0 0 8px' }}>{system.deploymentEnvironment}</dd>
                <dt style={{ color: workspaceTokens.colors.textMuted }}>Monitoring</dt><dd style={{ margin: '0 0 8px' }}>{system.monitoringStatus}</dd>
                <dt style={{ color: workspaceTokens.colors.textMuted }}>Lifecycle</dt><dd style={{ margin: 0 }}>{system.lifecycleStage.replace(/_/g, ' ')}</dd>
              </dl>
            </Card>
            <Card padding="md">
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Status</h3>
              <p style={{ fontSize: 13 }}>Risk: <RiskBadge level={system.riskClassification} /></p>
              <p style={{ fontSize: 13 }}>Compliance: <StatusBadge status={system.complianceStatus} /></p>
              {system.trustScore !== undefined && <p style={{ fontSize: 13 }}>Trust score: <strong>{system.trustScore}</strong></p>}
            </Card>
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Lifecycle progress</h3>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 24 }}>
            {progress.map((p) => (
              <span key={p.stage} style={{ fontSize: 11, padding: '4px 8px', borderRadius: 4, background: p.status === 'completed' ? `${workspaceTokens.colors.success}20` : p.status === 'pending' ? `${workspaceTokens.colors.warning}20` : workspaceTokens.colors.border }}>
                {p.stage.replace(/_/g, ' ')}
              </span>
            ))}
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Associated risks ({risks.length})</h3>
          {risks.map((r) => (
            <Card key={r.id} padding="sm" style={{ marginBottom: 6, fontSize: 13 }}>
              <strong>{r.title}</strong> — <RiskBadge level={r.impact} /> · {r.status}
            </Card>
          ))}

          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '24px 0 12px' }}>Monitoring events</h3>
          {events.length === 0 ? <p style={{ fontSize: 13, color: workspaceTokens.colors.textMuted }}>No events recorded.</p> : events.map((e) => (
            <Card key={e.id} padding="sm" style={{ marginBottom: 6, fontSize: 12 }}>
              {e.title} — <RiskBadge level={e.severity} />
            </Card>
          ))}
        </GovernanceShell>
      </ModuleScaffold>
    </WorkspaceLayoutClient>
  );
}
