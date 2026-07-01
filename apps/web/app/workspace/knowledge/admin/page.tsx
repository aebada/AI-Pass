'use client';

import { useEffect, useState } from 'react';
import { Card, workspaceTokens } from '@ai-pass/ui';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { KnowledgeShell } from '../components/KnowledgeShell';

export default function KnowledgeAdminPage() {
  const [connectors, setConnectors] = useState<{ category: string; connectors: string[]; status: string }[]>([]);
  const [vectorProviders, setVectorProviders] = useState<{ id: string; name: string; status: string }[]>([]);
  const [endpoints, setEndpoints] = useState<{ name: string; path: string; type: string; enabled: boolean }[]>([]);

  useEffect(() => {
    fetch('/api/v1/knowledge/status').then((r) => r.json()).then((res) => {
      setConnectors(res.data?.connectors ?? []);
      setVectorProviders(res.data?.vectorProviders ?? []);
      setEndpoints(res.data?.endpoints ?? []);
    });
  }, []);

  return (
    <WorkspaceLayoutClient title="Administration" subtitle="Connectors, vector stores, API endpoints, ontology">
      <KnowledgeShell>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Connector catalog</h3>
        {connectors.map((c) => (
          <Card key={c.category} padding="md" style={{ marginBottom: 8 }}>
            <strong style={{ fontSize: 14 }}>{c.category}</strong>
            <p style={{ fontSize: 12, color: workspaceTokens.colors.textMuted, margin: '4px 0 0' }}>{c.connectors.join(', ')} · {c.status}</p>
          </Card>
        ))}

        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '24px 0 12px' }}>Vector store providers</h3>
        {vectorProviders.map((v) => (
          <Card key={v.id} padding="sm" style={{ marginBottom: 6, fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
            <span>{v.name}</span>
            <span style={{ color: workspaceTokens.colors.textMuted }}>{v.status}</span>
          </Card>
        ))}

        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '24px 0 12px' }}>Published endpoints</h3>
        {endpoints.map((e) => (
          <Card key={e.path} padding="sm" style={{ marginBottom: 6, fontSize: 13 }}>
            <strong>{e.name}</strong> — <code>{e.path}</code> ({e.type}) {e.enabled ? '✓' : '✗'}
          </Card>
        ))}
      </KnowledgeShell>
    </WorkspaceLayoutClient>
  );
}
