'use client';

import Link from 'next/link';
import { DEMO_SCENARIOS, runSemanticDemo } from '@ai-pass/semantic-graph';
import { useMemo, useState } from 'react';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { ModuleScaffold } from '../../../components/workspace/ModuleScaffold';

export default function SemanticGraphAppPage() {
  const [scenarioId, setScenarioId] = useState(DEMO_SCENARIOS[0]!.id);
  const snap = useMemo(() => runSemanticDemo({ scenarioId }), [scenarioId]);

  return (
    <WorkspaceLayoutClient
      title="Semantic Graph"
      subtitle="Governed ontology for agent context — Graph RAG, compliance, lineage"
    >
      <ModuleScaffold
        title="Enterprise semantic layer"
        description="Agents answer from your business model: entities, relationships, obligations, and decision chains — with provenance."
        moduleId="semantic-graph"
      >
        <p style={{ marginTop: 0 }}>
          <Link href="/demo" style={{ fontWeight: 700 }}>
            Open the full interactive demo →
          </Link>
        </p>

        <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Scenario</label>
        <select
          value={scenarioId}
          onChange={(e) => setScenarioId(e.target.value)}
          style={{ width: '100%', maxWidth: 480, padding: '10px 12px', marginBottom: 16 }}
        >
          {DEMO_SCENARIOS.map((s) => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>

        <div style={{
          borderLeft: '3px solid #0f766e',
          background: 'rgba(15,118,110,0.06)',
          borderRadius: '0 12px 12px 0',
          padding: '12px 14px',
          marginBottom: 16,
        }}>
          <strong style={{ display: 'block', marginBottom: 6 }}>
            {snap.scenario.question}
          </strong>
          <p style={{ margin: 0, lineHeight: 1.6 }}>{snap.answer.answer}</p>
        </div>

        <h3 style={{ fontSize: 14, fontWeight: 700 }}>Provenance</h3>
        <ul style={{ paddingLeft: 18, marginTop: 8 }}>
          {snap.answer.evidence.map((e) => (
            <li key={e.nodeId} style={{ marginBottom: 6 }}>
              <strong>{e.label}</strong> — {e.excerpt}
            </li>
          ))}
        </ul>

        <h3 style={{ fontSize: 14, fontWeight: 700, marginTop: 20 }}>Compliance snapshot</h3>
        <p style={{ color: 'var(--text-muted, #64748b)' }}>
          {snap.compliance.covered} covered · {snap.compliance.partial} partial · {snap.compliance.gap} gaps
        </p>

        <pre style={{
          marginTop: 16,
          padding: 12,
          background: 'var(--bg-elevated, #f6f7f9)',
          border: '1px solid var(--border, #e5e7eb)',
          borderRadius: 8,
          fontSize: 12,
          overflow: 'auto',
        }}>
{`import { runSemanticDemo } from '@ai-pass/semantic-graph';

const result = runSemanticDemo({ scenarioId: 'banking-wire' });
// result.answer + result.graph + result.gaps + result.lineage`}
        </pre>
      </ModuleScaffold>
    </WorkspaceLayoutClient>
  );
}
