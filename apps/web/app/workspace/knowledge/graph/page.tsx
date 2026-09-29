'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Card, workspaceTokens } from '@ai-pass/ui';
import { DEMO_SCENARIOS, listGraphOverview, runSemanticDemo } from '@ai-pass/semantic-graph';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { KnowledgeShell } from '../components/KnowledgeShell';

export default function KnowledgeGraphPage() {
  const [scenarioId, setScenarioId] = useState(DEMO_SCENARIOS[0]!.id);
  const snap = useMemo(() => runSemanticDemo({ scenarioId }), [scenarioId]);
  const overview = useMemo(() => listGraphOverview(snap.scenario.industry), [snap.scenario.industry]);

  return (
    <WorkspaceLayoutClient
      title="Knowledge Graph"
      subtitle="Semantic enterprise twin — Graph RAG with provenance"
    >
      <KnowledgeShell>
        <Card padding="md" style={{ marginBottom: 16 }}>
          <p style={{ margin: '0 0 12px', fontSize: 14 }}>
            Interactive demo:{' '}
            <Link href="/demo" style={{ fontWeight: 700 }}>
              /demo — semantic graph walkthrough
            </Link>
          </p>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Scenario</label>
          <select
            value={scenarioId}
            onChange={(e) => setScenarioId(e.target.value)}
            style={{ width: '100%', maxWidth: 420, padding: '8px 10px' }}
          >
            {DEMO_SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
          <p style={{ margin: '12px 0 0', fontSize: 13, color: workspaceTokens.colors.textMuted }}>
            Graph overview: {overview.nodes.length} entities · {overview.edges.length} relationships ·{' '}
            {snap.fullGraphStats.inferredEdges} inferred · answer hops {snap.answer.hops.length}
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: workspaceTokens.colors.textMuted }}>
            Ontology {snap.ontology.classes}c/{snap.ontology.properties}p · Rules{' '}
            {snap.ruleEvaluation.passed}/{snap.ruleEvaluation.rulesEvaluated} · Layers{' '}
            {snap.layers.layers.map((l) => l.id).join(', ')}
          </p>
        </Card>

        <Card padding="md" style={{ marginBottom: 16, borderLeft: '3px solid #0f766e' }}>
          <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 14 }}>{snap.scenario.question}</p>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{snap.answer.answer}</p>
        </Card>

        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Provenance path</h3>
        {snap.answer.pathLabels.map((p) => (
          <Card key={p} padding="sm" style={{ marginBottom: 6, fontSize: 13 }}>
            {p}
          </Card>
        ))}

        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '20px 0 12px' }}>Evidence nodes</h3>
        {snap.answer.evidence.map((e) => (
          <Card key={e.nodeId} padding="sm" style={{ marginBottom: 6, fontSize: 13 }}>
            <span style={{ fontWeight: 600 }}>{e.label}</span>
            <span style={{ color: workspaceTokens.colors.textMuted }}> — {e.excerpt}</span>
          </Card>
        ))}
      </KnowledgeShell>
    </WorkspaceLayoutClient>
  );
}
