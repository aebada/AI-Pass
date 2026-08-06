'use client';

import { useState } from 'react';
import { Card, workspaceTokens } from '@ai-pass/ui';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { KnowledgeShell } from '../components/KnowledgeShell';

export default function SearchWorkspacePage() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('hybrid');
  const [results, setResults] = useState<{ content: string; score: number; citation?: string }[]>([]);

  async function search() {
    const res = await fetch('/api/v1/knowledge/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, mode, includeGraph: true }),
    });
    const data = await res.json();
    setResults(data.data?.chunks ?? []);
  }

  return (
    <WorkspaceLayoutClient title="Search Workspace" subtitle="Natural language, semantic, and graph exploration">
      <KnowledgeShell>
        <Card padding="md" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search knowledge base..." style={{ flex: 1, minWidth: 240, padding: 8, borderRadius: 6, border: `1px solid ${workspaceTokens.colors.border}` }} />
            <select value={mode} onChange={(e) => setMode(e.target.value)} style={{ padding: 8, borderRadius: 6 }}>
              <option value="semantic">Semantic</option>
              <option value="keyword">Keyword</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <button onClick={search} style={{ padding: '8px 16px', borderRadius: 6, background: workspaceTokens.colors.accent, color: '#fff', border: 'none', cursor: 'pointer' }}>Search</button>
          </div>
        </Card>

        {results.map((r, i) => (
          <Card key={i} padding="md" style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: workspaceTokens.colors.textMuted, marginBottom: 4 }}>Score: {(r.score * 100).toFixed(0)}% {r.citation && `· ${r.citation}`}</div>
            <p style={{ fontSize: 14, margin: 0 }}>{r.content}</p>
          </Card>
        ))}
      </KnowledgeShell>
    </WorkspaceLayoutClient>
  );
}
