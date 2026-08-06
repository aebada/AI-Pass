'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, workspaceTokens } from '@ai-pass/ui';
import { ModuleScaffold } from '../../components/workspace/ModuleScaffold';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import { KnowledgeShell, StatCard } from './components/KnowledgeShell';

interface StatusPayload {
  status: {
    sources: number;
    activePipelines: number;
    documents: number;
    chunks: number;
    embeddings: number;
    graphEntities: number;
    graphEdges: number;
    syncEvents: number;
    retrievalLatencyMs: number;
    failures: number;
    storageBytes: number;
  };
}

export default function KnowledgeDashboardPage() {
  const [data, setData] = useState<StatusPayload | null>(null);

  useEffect(() => {
    fetch('/api/v1/knowledge/status')
      .then((r) => r.json())
      .then((res) => setData(res.data ?? null))
      .catch(() => setData(null));
  }, []);

  const s = data?.status;

  return (
    <WorkspaceLayoutClient title="Knowledge" subtitle="Enterprise knowledge infrastructure — single source of truth for AI context">
      <ModuleScaffold
        title="Knowledge Pipeline"
        description="Ingest, enrich, index, and serve knowledge to all AI agents and applications."
        moduleId="knowledge"
        icon="book-open"
        status="done"
        features={['Multi-source connectors', 'Visual pipelines', 'Knowledge graph', 'Unified RAG API', 'LiveSync sync']}
        actions={[
          { label: 'Add source', href: '/workspace/knowledge/sources', primary: true },
          { label: 'RAG playground', href: '/workspace/knowledge/retrieval' },
        ]}
      >
        <KnowledgeShell>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12, marginBottom: 24 }}>
            <StatCard label="Sources" value={s?.sources ?? '—'} />
            <StatCard label="Active Pipelines" value={s?.activePipelines ?? '—'} tone="success" />
            <StatCard label="Documents" value={s?.documents ?? '—'} />
            <StatCard label="Chunks" value={s?.chunks ?? '—'} />
            <StatCard label="Embeddings" value={s?.embeddings ?? '—'} />
            <StatCard label="Graph Entities" value={s?.graphEntities ?? '—'} />
            <StatCard label="Graph Edges" value={s?.graphEdges ?? '—'} />
            <StatCard label="Sync Events" value={s?.syncEvents ?? '—'} />
            <StatCard label="Retrieval (ms)" value={s?.retrievalLatencyMs ?? '—'} tone="success" />
            <StatCard label="Failures" value={s?.failures ?? 0} tone={s?.failures ? 'error' : undefined} />
            <StatCard label="Storage" value={s ? `${(s.storageBytes / 1024).toFixed(0)} KB` : '—'} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Card padding="md">
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Quick actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link href="/workspace/knowledge/sources" style={{ color: workspaceTokens.colors.accent, fontSize: 13 }}>Connect data source →</Link>
                <Link href="/workspace/knowledge/pipelines" style={{ color: workspaceTokens.colors.accent, fontSize: 13 }}>Build pipeline →</Link>
                <Link href="/workspace/knowledge/retrieval" style={{ color: workspaceTokens.colors.accent, fontSize: 13 }}>Test RAG retrieval →</Link>
                <Link href="/workspace/knowledge/sync" style={{ color: workspaceTokens.colors.accent, fontSize: 13 }}>Monitor synchronization →</Link>
              </div>
            </Card>
            <Card padding="md">
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Integration</h3>
              <p style={{ fontSize: 13, color: workspaceTokens.colors.textMuted, margin: 0, lineHeight: 1.5 }}>
                All agents retrieve context via <code>RAGService</code>. LiveSync emits <code>knowledge.updated</code> events.
                Wallet tracks embedding, indexing, and retrieval credits.
              </p>
            </Card>
          </div>
        </KnowledgeShell>
      </ModuleScaffold>
    </WorkspaceLayoutClient>
  );
}
