'use client';

import { useEffect, useState } from 'react';
import { Card, workspaceTokens } from '@ai-pass/ui';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { KnowledgeShell, StatCard } from '../components/KnowledgeShell';

export default function EmbeddingsPage() {
  const [status, setStatus] = useState<{ embeddings: number; chunks: number } | null>(null);
  const [providers, setProviders] = useState<{ id: string; name: string; status: string }[]>([]);

  useEffect(() => {
    fetch('/api/v1/knowledge/status').then((r) => r.json()).then((res) => {
      setStatus(res.data?.status);
      setProviders(res.data?.embeddingProviders ?? []);
    });
  }, []);

  return (
    <WorkspaceLayoutClient title="Embeddings" subtitle="Embedding models, vectors, and index management">
      <KnowledgeShell>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
          <StatCard label="Total Embeddings" value={status?.embeddings ?? '—'} />
          <StatCard label="Indexed Chunks" value={status?.chunks ?? '—'} />
        </div>

        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Embedding providers</h3>
        {providers.map((p) => (
          <Card key={p.id} padding="md" style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <strong>{p.name}</strong>
              <span style={{ color: workspaceTokens.colors.textMuted }}>{p.status}</span>
            </div>
          </Card>
        ))}
      </KnowledgeShell>
    </WorkspaceLayoutClient>
  );
}
