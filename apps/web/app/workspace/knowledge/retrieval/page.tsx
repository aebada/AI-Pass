'use client';

import { useEffect, useState } from 'react';
import { Card, workspaceTokens } from '@ai-pass/ui';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { KnowledgeShell } from '../components/KnowledgeShell';

export default function RetrievalPlaygroundPage() {
  const [query, setQuery] = useState('What is the return policy?');
  const [testQueries, setTestQueries] = useState<string[]>([]);
  const [result, setResult] = useState<{
    chunks: { content: string; score: number }[];
    citations: string[];
    confidence: number;
    graphLinks: { name: string; type: string }[];
  } | null>(null);

  useEffect(() => {
    fetch('/api/v1/knowledge/status').then((r) => r.json()).then((res) => setTestQueries(res.data?.testQueries ?? []));
  }, []);

  async function runQuery(q?: string) {
    const res = await fetch('/api/v1/knowledge/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q ?? query, mode: 'hybrid', includeGraph: true, topK: 5 }),
    });
    const data = await res.json();
    setResult(data.data);
    if (q) setQuery(q);
  }

  return (
    <WorkspaceLayoutClient title="RAG Playground" subtitle="Retrieval testing - chunks, citations, confidence, graph links">
      <KnowledgeShell>
        <Card padding="md" style={{ marginBottom: 16 }}>
          <textarea value={query} onChange={(e) => setQuery(e.target.value)} rows={3} style={{ width: '100%', padding: 8, borderRadius: 6, border: `1px solid ${workspaceTokens.colors.border}`, marginBottom: 8 }} />
          <button onClick={() => runQuery()} style={{ padding: '8px 16px', borderRadius: 6, background: workspaceTokens.colors.accent, color: '#fff', border: 'none', cursor: 'pointer' }}>Run RAG Query</button>
        </Card>

        {testQueries.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: workspaceTokens.colors.textMuted }}>Test queries: </span>
            {testQueries.map((q) => (
              <button key={q} onClick={() => runQuery(q)} style={{ fontSize: 11, margin: '0 4px 4px 0', padding: '2px 8px', borderRadius: 4, border: `1px solid ${workspaceTokens.colors.border}`, cursor: 'pointer', background: 'transparent' }}>{q.slice(0, 30)}…</button>
            ))}
          </div>
        )}

        {result && (
          <>
            <Card padding="md" style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13 }}>Confidence: <strong>{(result.confidence * 100).toFixed(0)}%</strong></div>
              <div style={{ fontSize: 12, color: workspaceTokens.colors.textMuted, marginTop: 4 }}>Citations: {result.citations.join(', ')}</div>
              {result.graphLinks.length > 0 && (
                <div style={{ fontSize: 12, marginTop: 4 }}>Graph links: {result.graphLinks.map((g) => `${g.name} (${g.type})`).join(', ')}</div>
              )}
            </Card>
            {result.chunks.map((c, i) => (
              <Card key={i} padding="md" style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: workspaceTokens.colors.textMuted }}>Score: {(c.score * 100).toFixed(0)}%</div>
                <p style={{ fontSize: 14, margin: '4px 0 0' }}>{c.content}</p>
              </Card>
            ))}
          </>
        )}
      </KnowledgeShell>
    </WorkspaceLayoutClient>
  );
}
