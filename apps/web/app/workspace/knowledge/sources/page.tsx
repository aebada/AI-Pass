'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Card, workspaceTokens } from '@ai-pass/ui';
import {
  KNOWLEDGE_CONNECTORS,
  addKnowledgeSource,
  formatLastSync,
  loadKnowledgeSources,
  touchKnowledgeSourceSync,
  type KnowledgeConnector,
  type KnowledgeSource,
} from '@/lib/knowledge-sources-storage';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { KnowledgeShell } from '../components/KnowledgeShell';

export default function KnowledgeSourcesPage() {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [name, setName] = useState('');
  const [connector, setConnector] = useState<KnowledgeConnector>('pdf');

  useEffect(() => {
    setSources(loadKnowledgeSources());
  }, []);

  function handleConnect(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const source = addKnowledgeSource(name, connector);
    setSources((prev) => [...prev, source]);
    setName('');
  }

  function handleSync(sourceId: string) {
    setSources(touchKnowledgeSourceSync(sourceId));
  }

  return (
    <WorkspaceLayoutClient
      title="Data Sources"
      subtitle="Connect files, databases, enterprise systems, APIs, and streams"
    >
      <KnowledgeShell>
        <Card padding="md" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 8px' }}>Add source</h3>
          <p style={{ fontSize: 12, color: workspaceTokens.colors.textMuted, margin: '0 0 12px' }}>
            Connections persist in your browser (localStorage) on static hosting — no API required.
          </p>
          <form
            style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
            onSubmit={handleConnect}
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Source name"
              style={{
                flex: 1,
                minWidth: 200,
                padding: 8,
                borderRadius: 6,
                border: `1px solid ${workspaceTokens.colors.border}`,
              }}
            />
            <select
              value={connector}
              onChange={(e) => setConnector(e.target.value as KnowledgeConnector)}
              style={{ padding: 8, borderRadius: 6 }}
            >
              {KNOWLEDGE_CONNECTORS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                background: workspaceTokens.colors.accent,
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Connect
            </button>
          </form>
        </Card>

        {sources.map((s) => (
          <Card key={s.id} padding="md" style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, gap: 12 }}>
              <div>
                <strong>{s.name}</strong>
                <p style={{ fontSize: 12, color: workspaceTokens.colors.textMuted, margin: '4px 0 0' }}>
                  {s.type} · {s.connector} · connected {formatLastSync(s.connectedAt)}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: workspaceTokens.colors.textMuted, fontSize: 12 }}>
                  {s.chunkCount.toLocaleString()} chunks · {s.syncStatus}
                </span>
                <p style={{ fontSize: 11, color: workspaceTokens.colors.textMuted, margin: '4px 0 0' }}>
                  Last sync {formatLastSync(s.lastSyncedAt)}
                </p>
                <button
                  type="button"
                  onClick={() => handleSync(s.id)}
                  style={{
                    marginTop: 6,
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: `1px solid ${workspaceTokens.colors.border}`,
                    background: 'transparent',
                    color: workspaceTokens.colors.accent,
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  Sync now
                </button>
              </div>
            </div>
          </Card>
        ))}
      </KnowledgeShell>
    </WorkspaceLayoutClient>
  );
}
