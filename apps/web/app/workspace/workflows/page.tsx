'use client';

import { defaultWorkspaceService } from '@ai-pass/platform-core';
import { Card, workspaceTokens } from '@ai-pass/ui';
import { ModuleScaffold } from '../../components/workspace/ModuleScaffold';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';

export default function WorkflowsPage() {
  const workflows = defaultWorkspaceService.getDashboard().runningWorkflows;

  return (
    <WorkspaceLayoutClient title="Workflows" subtitle="Visual workflow builder with LiveSync orchestration">
      <ModuleScaffold
        title="Workflow Builder"
        description="Design event-driven workflows. Connect agents, knowledge, and governance steps."
        moduleId="workflows"
        icon="⟳"
        status="stub"
        features={['Visual canvas', 'LiveSync triggers', 'Step library', 'Execution monitoring']}
        actions={[
          { label: 'Open LiveSync', href: '/workspace/workflows/livesync', primary: true },
          { label: 'Builder Studio', href: '/studio' },
        ]}
      >
        <div
          style={{
            border: `2px dashed ${workspaceTokens.colors.border}`,
            borderRadius: 12,
            padding: 48,
            textAlign: 'center',
            color: workspaceTokens.colors.textMuted,
            marginBottom: 24,
          }}
        >
          <p style={{ fontSize: 14, margin: 0 }}>Visual workflow canvas - drag steps, connect triggers</p>
          <p style={{ fontSize: 12, margin: '8px 0 0' }}>Scaffold ready for Builder Studio integration</p>
        </div>
        {workflows.map((w) => (
          <Card key={w.id} padding="md" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <strong>{w.name}</strong>
              <span style={{ color: workspaceTokens.colors.textMuted }}>{w.stepsCompleted}/{w.stepsTotal} steps</span>
            </div>
          </Card>
        ))}
      </ModuleScaffold>
    </WorkspaceLayoutClient>
  );
}
