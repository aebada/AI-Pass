'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import styles from './lifecycle.module.css';

type Snapshot = {
  stats: { nodes: number; edges: number; mappings: number; changeSets: number; apps: number };
  ontologies: {
    id: string;
    name: string;
    version: string;
    entities: { id: string; label: string; domain: string }[];
    relations: { id: string; label: string }[];
  }[];
  datasets: { id: string; name: string; productLine: string; ontologyId: string }[];
  mappings: {
    id: string;
    name: string;
    sourceSystem: string;
    status: string;
    rules: { id: string; sourceField: string; targetEntityType: string; confidence: number; confirmedByEngineer: boolean }[];
  }[];
  apps: { id: string; name: string; kind: string; widgets: string[] }[];
  sampleNodes: { id: string; typeId: string; label: string }[];
  sampleEdges: { id: string; typeId: string; fromId: string; toId: string }[];
};

type Tab = 'overview' | 'ontology' | 'mapping' | 'graph' | 'apps';

export default function LifecycleWorkspacePage() {
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [msg, setMsg] = useState('');
  const [question, setQuestion] = useState(
    'Which VINs with BCM rev B and SW 4.2 can trigger B1234?',
  );
  const [exploreOut, setExploreOut] = useState('');
  const [issues, setIssues] = useState<{ severity: string; summary: string }[]>([]);
  const [inspectOut, setInspectOut] = useState('');

  const refresh = useCallback(async () => {
    const res = await fetch('/api/v1/lifecycle');
    setSnap((await res.json()) as Snapshot);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const ontology = snap?.ontologies[0];
  const dataset = snap?.datasets[0];

  async function runSuggestAndIngest() {
    if (!dataset) return;
    setMsg('');
    const create = await fetch('/api/v1/lifecycle/mapping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        name: 'Teamcenter BOM drop',
        sourceSystem: 'teamcenter',
        sourceFormat: 'json',
      }),
    });
    const { mapping } = (await create.json()) as { mapping: { id: string } };
    await fetch('/api/v1/lifecycle/mapping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'suggest',
        mappingId: mapping.id,
        sourceFields: ['partNumber', 'reqId', 'testId', 'swVersion', 'vin', 'defectCode'],
      }),
    });
    await fetch('/api/v1/lifecycle/mapping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'publish', mappingId: mapping.id }),
    });
    const ingest = await fetch('/api/v1/lifecycle/mapping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'ingest',
        datasetId: dataset.id,
        mappingId: mapping.id,
        records: [
          {
            partNumber: 'A-DOOR-220',
            reqId: 'REQ-330',
            testId: 'TC-220',
            swVersion: 'DOOR-SW-1.1',
            vin: 'WVWZZZ1JZXW000099',
            defectCode: 'D-778',
          },
        ],
      }),
    });
    const { changeSet } = (await ingest.json()) as {
      changeSet?: { nodesAdded: number; edgesAdded: number; deduped: number };
    };
    setMsg(
      changeSet
        ? `Ingested mapping: +${changeSet.nodesAdded} nodes, +${changeSet.edgesAdded} edges, ${changeSet.deduped} deduped.`
        : 'Ingest finished.',
    );
    await refresh();
  }

  async function runExplore(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/v1/lifecycle/explore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, datasetId: dataset?.id }),
    });
    const json = (await res.json()) as {
      answer?: { answer: string; path: string[]; confidence: number };
    };
    setExploreOut(
      json.answer
        ? `${json.answer.answer}\nPath: ${json.answer.path.join(' → ') || '—'}\nConfidence: ${json.answer.confidence}`
        : 'No answer',
    );
  }

  async function runRequirements() {
    const res = await fetch(
      `/api/v1/lifecycle/requirements${dataset ? `?datasetId=${dataset.id}` : ''}`,
    );
    const json = (await res.json()) as { issues: { severity: string; summary: string }[] };
    setIssues(json.issues || []);
  }

  async function runInspector() {
    const res = await fetch('/api/v1/lifecycle/inspector', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketOrDefect: 'B1234', datasetId: dataset?.id }),
    });
    const json = (await res.json()) as {
      result?: { summary: string; path: string[] };
    };
    setInspectOut(
      json.result
        ? `${json.result.summary}\nPath: ${json.result.path.join(' → ')}`
        : 'No result',
    );
  }

  async function addOntologyEntity() {
    if (!ontology) return;
    await fetch('/api/v1/lifecycle/ontology', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add_entity',
        ontologyId: ontology.id,
        entity: {
          id: 'HarnessGate',
          label: 'Harness gate',
          domain: 'software',
          definition: 'Confirmation gate before irreversible twin action.',
          attributes: [{ id: 'gateId', label: 'Gate ID', dataType: 'string' }],
        },
      }),
    });
    setMsg('Ontology entity HarnessGate added.');
    await refresh();
  }

  return (
    <WorkspaceLayoutClient
      title="Lifecycle Intelligence"
      subtitle="Build product ontologies and knowledge graphs — Spread-class, first-party."
    >
      <div className={styles.wrap}>
        <section className={styles.hero}>
          <h2>From scattered PLM data to one product graph</h2>
          <p>
            Ingest sources, agentic-map with provenance, resolve versions into a dataset, then
            explore with Requirements Manager, Product Explorer, and Error Inspector.
          </p>
          <div className={styles.actions}>
            <Link href="/lifecycle" className={styles.btnGhost}>
              Product page
            </Link>
            <Link href="/workspace/connect" className={styles.btnGhost}>
              Connect PLM
            </Link>
            <Link href="/graph-builder" className={styles.btnGhost}>
              Graph Builder
            </Link>
            <button type="button" className={styles.btn} onClick={() => void refresh()}>
              Refresh
            </button>
          </div>
        </section>

        {msg ? <div className={styles.success}>{msg}</div> : null}

        <div className={styles.tabs} role="tablist">
          {(
            [
              ['overview', 'Overview'],
              ['ontology', 'Ontology'],
              ['mapping', 'Data mapping'],
              ['graph', 'Knowledge graph'],
              ['apps', 'Studio apps'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={tab === id ? styles.tabActive : styles.tab}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <section className={styles.panel}>
            <h3>Platform stats</h3>
            <p className={styles.meta}>
              Nodes {snap?.stats.nodes ?? 0} · Edges {snap?.stats.edges ?? 0} · Mappings{' '}
              {snap?.stats.mappings ?? 0} · Change sets {snap?.stats.changeSets ?? 0} · Apps{' '}
              {snap?.stats.apps ?? 0}
            </p>
            <div className={styles.grid} style={{ marginTop: '0.75rem' }}>
              <article className={styles.card}>
                <span className={styles.badge}>01</span>
                <h4>Ingest</h4>
                <p>PLM / CAD / ERP / test sources without migration.</p>
              </article>
              <article className={styles.card}>
                <span className={styles.badge}>02</span>
                <h4>Map &amp; trace</h4>
                <p>Rules → AI suggest → engineer confirm · full provenance.</p>
              </article>
              <article className={styles.card}>
                <span className={styles.badge}>03</span>
                <h4>Resolve &amp; version</h4>
                <p>Dedup into one connected product dataset.</p>
              </article>
              <article className={styles.card}>
                <span className={styles.badge}>04</span>
                <h4>Serve</h4>
                <p>API + MCP for agents, apps, and analytics.</p>
              </article>
            </div>
          </section>
        )}

        {tab === 'ontology' && (
          <section className={styles.panel}>
            <h3>
              {ontology?.name || 'Ontology'}{' '}
              <span className={styles.meta}>v{ontology?.version}</span>
            </h3>
            <div className={styles.actions}>
              <button type="button" className={styles.btn} onClick={() => void addOntologyEntity()}>
                Add entity type
              </button>
            </div>
            <div className={styles.grid} style={{ marginTop: '0.75rem' }}>
              {(ontology?.entities || []).map((e) => (
                <article key={e.id} className={styles.card}>
                  <span className={styles.badge}>{e.domain}</span>
                  <h4>{e.label}</h4>
                  <p className={styles.meta}>{e.id}</p>
                </article>
              ))}
            </div>
            <h3 style={{ marginTop: '1.25rem' }}>Relations</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Label</th>
                </tr>
              </thead>
              <tbody>
                {(ontology?.relations || []).map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {tab === 'mapping' && (
          <section className={styles.panel}>
            <h3>Agentic data mapping</h3>
            <p className={styles.meta}>
              Deterministic rules first, AI-assisted matching, engineer confirmation.
            </p>
            <div className={styles.actions}>
              <button type="button" className={styles.btn} onClick={() => void runSuggestAndIngest()}>
                Demo map + ingest
              </button>
            </div>
            {(snap?.mappings || []).length === 0 ? (
              <p style={{ marginTop: '0.75rem' }}>No mappings yet — run the demo.</p>
            ) : (
              <table className={styles.table} style={{ marginTop: '0.75rem' }}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Rules</th>
                  </tr>
                </thead>
                <tbody>
                  {snap!.mappings.map((m) => (
                    <tr key={m.id}>
                      <td>{m.name}</td>
                      <td>{m.sourceSystem}</td>
                      <td>{m.status}</td>
                      <td>{m.rules.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {tab === 'graph' && (
          <section className={styles.panel}>
            <h3>Knowledge graph</h3>
            <p className={styles.meta}>
              Dataset: {dataset?.name || '—'} ({dataset?.productLine})
            </p>
            <form className={styles.form} onSubmit={runExplore}>
              <label>
                Product Explorer question
                <input value={question} onChange={(e) => setQuestion(e.target.value)} />
              </label>
              <button type="submit" className={styles.btn}>
                Ask graph
              </button>
            </form>
            {exploreOut ? (
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.86rem', marginTop: '0.75rem' }}>
                {exploreOut}
              </pre>
            ) : null}
            <h3 style={{ marginTop: '1.25rem' }}>Sample entities</h3>
            <div className={styles.grid}>
              {(snap?.sampleNodes || []).slice(0, 12).map((n) => (
                <article key={n.id} className={styles.card}>
                  <span className={styles.badge}>{n.typeId}</span>
                  <h4>{n.label}</h4>
                </article>
              ))}
            </div>
          </section>
        )}

        {tab === 'apps' && (
          <section className={styles.panel}>
            <h3>AI Studio apps</h3>
            <div className={styles.grid}>
              {(snap?.apps || []).map((a) => (
                <article key={a.id} className={styles.card}>
                  <span className={styles.badge}>{a.kind}</span>
                  <h4>{a.name}</h4>
                  <p>{a.widgets.join(' · ')}</p>
                </article>
              ))}
            </div>
            <div className={styles.actions}>
              <button type="button" className={styles.btn} onClick={() => void runRequirements()}>
                Run Requirements Manager
              </button>
              <button type="button" className={styles.btn} onClick={() => void runInspector()}>
                Run Error Inspector (B1234)
              </button>
            </div>
            {issues.length > 0 && (
              <ul style={{ marginTop: '0.75rem' }}>
                {issues.map((i, idx) => (
                  <li key={idx}>
                    <strong>{i.severity}</strong> — {i.summary}
                  </li>
                ))}
              </ul>
            )}
            {inspectOut ? (
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.86rem', marginTop: '0.75rem' }}>
                {inspectOut}
              </pre>
            ) : null}
          </section>
        )}
      </div>
    </WorkspaceLayoutClient>
  );
}
