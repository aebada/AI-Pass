'use client';

import { useEffect, useState } from 'react';
import { Card, workspaceTokens } from '@ai-pass/ui';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { KnowledgeShell } from '../components/KnowledgeShell';

const STAGES = ['connect', 'validate', 'clean', 'normalize', 'extract_metadata', 'extract_entities', 'relationships', 'chunk', 'embed', 'index', 'publish', 'sync'];

export default function PipelineBuilderPage() {
  const [templates, setTemplates] = useState<{ id: string; name: string; description: string; stages: string[] }[]>([]);
  const [sources, setSources] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch('/api/v1/knowledge/status').then((r) => r.json()).then((res) => setTemplates(res.data?.pipelineTemplates ?? []));
    fetch('/api/v1/knowledge/sources').then((r) => r.json()).then((res) => setSources(res.data ?? []));
  }, []);

  return (
    <WorkspaceLayoutClient title="Pipeline Builder" subtitle="Visual pipeline stages — Connect to Sync">
      <KnowledgeShell>
        <Card padding="md" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px' }}>Pipeline stages</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            {STAGES.map((stage, i) => (
              <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, padding: '4px 8px', borderRadius: 4, background: workspaceTokens.colors.surface, border: `1px solid ${workspaceTokens.colors.border}` }}>
                  {stage.replace(/_/g, ' ')}
                </span>
                {i < STAGES.length - 1 && <span style={{ color: workspaceTokens.colors.textMuted }}>→</span>}
              </div>
            ))}
          </div>
        </Card>

        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Templates</h3>
        {templates.map((t) => (
          <Card key={t.id} padding="md" style={{ marginBottom: 8 }}>
            <strong style={{ fontSize: 14 }}>{t.name}</strong>
            <p style={{ fontSize: 12, color: workspaceTokens.colors.textMuted, margin: '4px 0 8px' }}>{t.description}</p>
            <div style={{ fontSize: 11, color: workspaceTokens.colors.textMuted }}>{t.stages.join(' → ')}</div>
            {sources[0] && (
              <button
                onClick={() => fetch('/api/v1/knowledge/pipeline', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: t.name, sourceId: sources[0]!.id, templateId: t.id }) })}
                style={{ marginTop: 8, fontSize: 12, padding: '4px 12px', borderRadius: 4, border: `1px solid ${workspaceTokens.colors.border}`, cursor: 'pointer', background: 'transparent' }}
              >
                Create from template
              </button>
            )}
          </Card>
        ))}
      </KnowledgeShell>
    </WorkspaceLayoutClient>
  );
}
