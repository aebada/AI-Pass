'use client';

import { useEffect, useState } from 'react';
import { Card, workspaceTokens } from '@ai-pass/ui';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { KnowledgeShell } from '../components/KnowledgeShell';

export default function SyncMonitorPage() {
  const [sources, setSources] = useState<{ id: string; name: string; syncStatus: string; lastSyncedAt?: string }[]>([]);

  useEffect(() => {
    fetch('/api/v1/knowledge/sources').then((r) => r.json()).then((res) => setSources(res.data ?? []));
  }, []);

  async function triggerSync(sourceId: string) {
    await fetch('/api/v1/knowledge/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceId, force: true }),
    });
    const res = await fetch('/api/v1/knowledge/sources');
    const data = await res.json();
    setSources(data.data ?? []);
  }

  return (
    <WorkspaceLayoutClient title="Synchronization" subtitle="LiveSync monitor - re-index, refresh embeddings, update graph">
      <KnowledgeShell>
        <Card padding="md" style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: workspaceTokens.colors.textMuted, margin: 0 }}>
            Listens for <code>knowledge.updated</code> LiveSync events. On document change: re-index, refresh embeddings, update graph, notify agents.
          </p>
        </Card>

        {sources.map((s) => (
          <Card key={s.id} padding="md" style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: 14 }}>{s.name}</strong>
                <p style={{ fontSize: 12, color: workspaceTokens.colors.textMuted, margin: '4px 0 0' }}>
                  Status: {s.syncStatus} {s.lastSyncedAt && `· Last sync: ${new Date(s.lastSyncedAt).toLocaleString()}`}
                </p>
              </div>
              <button onClick={() => triggerSync(s.id)} style={{ fontSize: 12, padding: '6px 12px', borderRadius: 6, border: `1px solid ${workspaceTokens.colors.border}`, cursor: 'pointer', background: 'transparent' }}>Force sync</button>
            </div>
          </Card>
        ))}
      </KnowledgeShell>
    </WorkspaceLayoutClient>
  );
}
