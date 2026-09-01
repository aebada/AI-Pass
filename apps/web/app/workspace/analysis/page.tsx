'use client';

import { defaultWorkspaceService } from '@ai-pass/platform-core';
import { Card, workspaceTokens } from '@ai-pass/ui';
import { ModuleScaffold } from '../../components/workspace/ModuleScaffold';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';

export default function AnalysisPage() {
  const insights = defaultWorkspaceService.getDashboard().insights;

  return (
    <WorkspaceLayoutClient title="Analysis" subtitle="Analysis Studio - usage analytics and reports">
      <ModuleScaffold
        title="Analysis Studio"
        description="Usage analytics, cost reports, agent performance, and custom dashboards."
        moduleId="analysis"
        icon="📊"
        status="stub"
        features={['Usage reports', 'Cost analytics', 'Agent performance', 'Custom dashboards']}
        actions={[
          { label: 'Export report', href: '#', primary: true },
          { label: 'Presence Audit', href: '/workspace/presence' },
        ]}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {insights.map((i) => (
            <Card key={i.id} padding="md">
              <div style={{ fontSize: 24, fontWeight: 700, color: workspaceTokens.colors.accent }}>{i.metric}</div>
              <strong style={{ fontSize: 14 }}>{i.title}</strong>
              <p style={{ fontSize: 12, color: workspaceTokens.colors.textMuted, margin: '4px 0 0' }}>{i.description}</p>
            </Card>
          ))}
        </div>
      </ModuleScaffold>
    </WorkspaceLayoutClient>
  );
}
