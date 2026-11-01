'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { Card, workspaceTokens } from '@ai-pass/ui';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { KnowledgeShell } from '../components/KnowledgeShell';

type Ontology = {
  id: string;
  name: string;
  version: number;
  source: string;
  classes: Array<{ iri: string; label: string }>;
  properties: Array<{ iri: string; label: string }>;
};

type ExplorerNode = {
  id: string;
  kind: string;
  label: string;
  detail: string;
  activation?: number;
};

export default function OntologyStudioPage() {
  const [ontology, setOntology] = useState<Ontology | null>(null);
  const [nodes, setNodes] = useState<ExplorerNode[]>([]);
  const [text, setText] = useState(
    'Alice is a Employee. AI-Pass employs Alice. Alice owns Invoice Queue. Finance pays Supplier DU-7.',
  );
  const [turtle, setTurtle] = useState(':Employee a owl:Class .\n:hasTwin a owl:ObjectProperty .');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  async function refresh(id?: string) {
    const qs = id ? `?id=${encodeURIComponent(id)}` : '';
    const res = await fetch(`/api/v1/knowledge/ontology${qs}`);
    const data = await res.json();
    setOntology(data.active ?? null);
    setNodes(data.explorer ?? []);
  }

  useEffect(() => {
    refresh().catch(() => setStatus('Failed to load ontology studio'));
  }, []);

  async function run(action: string, body: Record<string, unknown> = {}) {
    setBusy(true);
    setStatus('');
    try {
      const res = await fetch('/api/v1/knowledge/ontology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ontologyId: ontology?.id, ...body, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setStatus(
        action === 'extract'
          ? `Extracted ${data.job?.triplesExtracted ?? 0} triples`
          : action === 'plan'
            ? `Plan ${data.plan?.id} · blast radius ${data.plan?.blastRadius}`
            : action === 'auto'
              ? `Auto ontology ${data.ontology?.name}`
              : 'Done',
      );
      await refresh(data.ontology?.id ?? ontology?.id);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Action failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <WorkspaceLayoutClient
      title="Ontology Studio"
      subtitle="Bring your ontology · OntoCast-style extraction · open change plans · auto-ontology · explorer"
    >
      <KnowledgeShell>
        <div style={{ display: 'grid', gap: 16 }}>
          <Card padding="md">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16 }}>{ontology?.name ?? 'Loading…'}</h3>
                <p style={{ margin: '6px 0 0', color: workspaceTokens.colors.textMuted, fontSize: 13 }}>
                  {ontology
                    ? `${ontology.classes.length} classes · ${ontology.properties.length} properties · v${ontology.version} · ${ontology.source}`
                    : 'Seeding core twin ontology…'}
                </p>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => run('auto', { name: 'Catalog auto ontology' })}
                style={btnStyle}
              >
                Auto-ontology from catalog
              </button>
            </div>
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 16 }}>
            <Card padding="md">
              <h3 style={{ margin: '0 0 8px', fontSize: 14 }}>Upload / define ontology</h3>
              <textarea
                value={turtle}
                onChange={(e) => setTurtle(e.target.value)}
                rows={6}
                style={areaStyle}
                placeholder="Paste Turtle class and property stubs"
              />
              <button
                type="button"
                disabled={busy}
                onClick={() => run('create', { name: 'Uploaded ontology', turtle })}
                style={{ ...btnStyle, marginTop: 8 }}
              >
                Add ontology
              </button>
            </Card>

            <Card padding="md">
              <h3 style={{ margin: '0 0 8px', fontSize: 14 }}>Semantic triple extraction</h3>
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} style={areaStyle} />
              <button
                type="button"
                disabled={busy || !ontology}
                onClick={() => run('extract', { text })}
                style={{ ...btnStyle, marginTop: 8 }}
              >
                Extract triples
              </button>
            </Card>
          </div>

          <Card padding="md">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 14 }}>Graph explorer</h3>
              <button
                type="button"
                disabled={busy || !ontology}
                onClick={() =>
                  run('plan', {
                    title: 'Add contractor twin class',
                    classes: [{ iri: 'aipass:Contractor', label: 'Contractor', parents: ['aipass:Person'] }],
                    properties: [
                      {
                        iri: 'aipass:contractsWith',
                        label: 'contracts with',
                        domain: 'aipass:Organization',
                        range: 'aipass:Contractor',
                        kind: 'object',
                      },
                    ],
                  })
                }
                style={btnStyle}
              >
                Plan ontology change
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
              {nodes.map((node) => (
                <div
                  key={node.id}
                  style={{
                    border: `1px solid ${workspaceTokens.colors.border}`,
                    borderRadius: 8,
                    padding: 10,
                    background: workspaceTokens.colors.bgElevated,
                  }}
                >
                  <div style={{ fontSize: 11, color: workspaceTokens.colors.accent, fontWeight: 700 }}>
                    {node.kind}
                    {typeof node.activation === 'number' ? ` · ${(node.activation * 100).toFixed(0)}%` : ''}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{node.label}</div>
                  <div style={{ fontSize: 12, color: workspaceTokens.colors.textMuted, marginTop: 4 }}>{node.detail}</div>
                </div>
              ))}
            </div>
          </Card>

          {status ? (
            <p style={{ margin: 0, fontSize: 13, color: workspaceTokens.colors.textMuted }}>{status}</p>
          ) : null}
        </div>
      </KnowledgeShell>
    </WorkspaceLayoutClient>
  );
}

const btnStyle: CSSProperties = {
  padding: '8px 14px',
  borderRadius: 8,
  border: 'none',
  background: workspaceTokens.colors.accent,
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
};

const areaStyle: CSSProperties = {
  width: '100%',
  borderRadius: 8,
  border: `1px solid ${workspaceTokens.colors.border}`,
  padding: 10,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 12,
};
