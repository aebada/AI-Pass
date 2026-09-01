'use client';

import { useEffect, useState } from 'react';
import { Card, workspaceTokens } from '@ai-pass/ui';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { KnowledgeShell } from '../components/KnowledgeShell';

export default function KnowledgeGraphPage() {
  const [entities, setEntities] = useState<{ id: string; name: string; type: string }[]>([]);
  const [edges, setEdges] = useState<{ subjectId: string; predicate: string; objectId: string }[]>([]);

  useEffect(() => {
    fetch('/api/v1/knowledge/graph/query', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      .then((r) => r.json())
      .then((res) => {
        setEntities(res.data?.entities ?? []);
        setEdges(res.data?.edges ?? []);
      });
  }, []);

  const entityMap = Object.fromEntries(entities.map((e) => [e.id, e]));

  return (
    <WorkspaceLayoutClient title="Knowledge Graph" subtitle="Entity-relationship visualization (stub)">
      <KnowledgeShell>
        <Card padding="md" style={{ marginBottom: 16, minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: 13, color: workspaceTokens.colors.textMuted, textAlign: 'center' }}>
            Graph visualization scaffold - {entities.length} entities, {edges.length} relationships
          </p>
        </Card>

        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Sample graph: company → products → policies</h3>
        {edges.map((e, i) => (
          <Card key={i} padding="sm" style={{ marginBottom: 6, fontSize: 13 }}>
            <span style={{ fontWeight: 600 }}>{entityMap[e.subjectId]?.name ?? e.subjectId}</span>
            <span style={{ color: workspaceTokens.colors.textMuted }}> -{e.predicate}→ </span>
            <span style={{ fontWeight: 600 }}>{entityMap[e.objectId]?.name ?? e.objectId}</span>
          </Card>
        ))}
      </KnowledgeShell>
    </WorkspaceLayoutClient>
  );
}
