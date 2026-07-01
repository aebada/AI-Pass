'use client';

import { useEffect, useState } from 'react';
import { Card, workspaceTokens } from '@ai-pass/ui';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { KnowledgeShell } from '../components/KnowledgeShell';

interface Source {
  id: string;
  name: string;
  type: string;
  connector: string;
  syncStatus: string;
  chunkCount: number;
}

export default function KnowledgeSourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [name, setName] = useState('');
  const [connector, setConnector] = useState('pdf');

  useEffect(() => {
    fetch('/api/v1/knowledge/sources').then((r) => r.json()).then((res) => setSources(res.data ?? []));
  }, []);

  async function addSource() {
    if (!name.trim()) return;
    const res = await fetch('/api/v1/knowledge/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, connector, type: 'file', connectorKind: connector }),
    });
    const data = await res.json();
    if (data.data) setSources((prev) => [...prev, data.data]);
    setName('');
  }

  return (
    <WorkspaceLayoutClient title="Data Sources" subtitle="Connect files, databases, enterprise systems, APIs, and streams">
      <KnowledgeShell>
        <Card padding="md" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Add source</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Source name" style={{ flex: 1, minWidth: 200, padding: 8, borderRadius: 6, border: `1px solid ${workspaceTokens.colors.border}` }} />
            <select value={connector} onChange={(e) => setConnector(e.target.value)} style={{ padding: 8, borderRadius: 6 }}>
              {['pdf', 'docx', 'txt', 'csv', 'postgres', 'sharepoint', 'rest', 'kafka'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button onClick={addSource} style={{ padding: '8px 16px', borderRadius: 6, background: workspaceTokens.colors.accent, color: '#fff', border: 'none', cursor: 'pointer' }}>Connect</button>
          </div>
        </Card>

        {sources.map((s) => (
          <Card key={s.id} padding="md" style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <div>
                <strong>{s.name}</strong>
                <p style={{ fontSize: 12, color: workspaceTokens.colors.textMuted, margin: '4px 0 0' }}>{s.type} · {s.connector}</p>
              </div>
              <span style={{ color: workspaceTokens.colors.textMuted }}>{s.chunkCount} chunks · {s.syncStatus}</span>
            </div>
          </Card>
        ))}
      </KnowledgeShell>
    </WorkspaceLayoutClient>
  );
}
