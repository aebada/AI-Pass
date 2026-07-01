'use client';

import { getGovernanceService } from '@ai-pass/governance';
import { ModuleScaffold } from '../../../components/workspace/ModuleScaffold';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { Card, workspaceTokens } from '@ai-pass/ui';
import { GovernanceShell, RiskBadge } from '../components/GovernanceShell';

export default function MonitoringPage() {
  const gov = getGovernanceService();
  const alerts = gov.monitoring.listAlerts();
  const incidents = gov.monitoring.listIncidents();
  const events = gov.monitoring.list();

  return (
    <WorkspaceLayoutClient title="Monitoring" subtitle="Alerts, incidents, drift detection, and anomaly tracking">
      <ModuleScaffold title="Continuous Monitoring" description="Hallucinations, confidence, policy violations, provider changes, and drift alerts." moduleId="governance" icon="🏛" status="done">
        <GovernanceShell>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Active alerts ({alerts.length})</h3>
          {alerts.map((e) => (
            <Card key={e.id} padding="md" style={{ marginBottom: 8, borderLeft: `3px solid ${workspaceTokens.colors.error}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: 13 }}>{e.title}</strong>
                <RiskBadge level={e.severity} />
              </div>
              {e.recommendation && <p style={{ fontSize: 12, color: workspaceTokens.colors.accent, margin: '8px 0 0' }}>{e.recommendation}</p>}
            </Card>
          ))}

          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '24px 0 12px' }}>Incidents ({incidents.length})</h3>
          {incidents.map((inc) => (
            <Card key={inc.incidentId} padding="md" style={{ marginBottom: 8 }}>
              <strong style={{ fontSize: 13 }}>{inc.incidentId}</strong>
              <p style={{ fontSize: 12, color: workspaceTokens.colors.textMuted }}>{inc.events.length} related events</p>
            </Card>
          ))}

          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '24px 0 12px' }}>All events</h3>
          {events.map((e) => (
            <Card key={e.id} padding="sm" style={{ marginBottom: 6, fontSize: 12, opacity: e.acknowledged ? 0.6 : 1 }}>
              {e.title} · {e.type} · {new Date(e.timestamp).toLocaleString()}
            </Card>
          ))}
        </GovernanceShell>
      </ModuleScaffold>
    </WorkspaceLayoutClient>
  );
}
