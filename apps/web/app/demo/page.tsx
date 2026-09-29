'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  DEMO_SCENARIOS,
  runSemanticDemo,
  type DemoScenario,
} from '@ai-pass/semantic-graph';
import { PremiumNav } from '../components/premium/PremiumNav';
import { DEMO_MAILTO } from '../lib/site-nav';
import styles from './demo.module.css';

type Tab = 'answer' | 'graph' | 'compliance' | 'lineage';

function layoutNodes(count: number, width: number, height: number) {
  if (count === 0) return [] as { x: number; y: number }[];
  const cx = width / 2;
  const cy = height / 2;
  const rx = Math.min(width, height) * 0.36;
  const ry = Math.min(width, height) * 0.32;
  return Array.from({ length: count }, (_, i) => {
    const a = (Math.PI * 2 * i) / count - Math.PI / 2;
    return { x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) };
  });
}

export default function SemanticDemoPage() {
  const [scenarioId, setScenarioId] = useState(DEMO_SCENARIOS[0]!.id);
  const [customQ, setCustomQ] = useState('');
  const [question, setQuestion] = useState(DEMO_SCENARIOS[0]!.question);
  const [tab, setTab] = useState<Tab>('answer');
  const [runKey, setRunKey] = useState(0);

  const snapshot = useMemo(
    () => runSemanticDemo({ scenarioId, question }),
    [scenarioId, question, runKey],
  );

  const positions = useMemo(() => {
    const pts = layoutNodes(snapshot.graph.nodes.length, 720, 340);
    return Object.fromEntries(snapshot.graph.nodes.map((n, i) => [n.id, pts[i]!]));
  }, [snapshot.graph.nodes]);

  function pickScenario(s: DemoScenario) {
    setScenarioId(s.id);
    setCustomQ('');
    setQuestion(s.question);
    setTab('answer');
    setRunKey((k) => k + 1);
  }

  function runAsk() {
    setQuestion(customQ.trim() || snapshot.scenario.question);
    setTab('answer');
    setRunKey((k) => k + 1);
  }

  return (
    <div className={styles.page}>
      <PremiumNav variant="landing" />

      <header className={styles.hero}>
        <span className={styles.eyebrow}>Interactive demo · Semantic Graph</span>
        <h1 className={styles.title}>Watch agents think in your business model</h1>
        <p className={styles.sub}>
          AI-Pass does not only route models — it grounds them in a governed knowledge graph.
          Pick a regulated scenario, see multi-hop Graph RAG with provenance, ontology compliance gaps,
          and the full agent decision lineage.
        </p>
      </header>

      <div className={styles.layout}>
        <aside className={styles.panel}>
          <h2 className={styles.panelTitle}>Scenarios</h2>
          <div className={styles.scenarioList}>
            {DEMO_SCENARIOS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`${styles.scenarioBtn} ${scenarioId === s.id ? styles.scenarioBtnActive : ''}`}
                onClick={() => pickScenario(s)}
              >
                <span className={styles.scenarioTitle}>{s.title}</span>
                <span className={styles.scenarioBlurb}>{s.blurb}</span>
              </button>
            ))}
          </div>

          <div className={styles.askRow}>
            <input
              className={styles.askInput}
              value={customQ}
              onChange={(e) => setCustomQ(e.target.value)}
              placeholder="Or type your own question…"
              onKeyDown={(e) => {
                if (e.key === 'Enter') runAsk();
              }}
            />
            <button type="button" className={styles.runBtn} onClick={runAsk}>
              Ask graph
            </button>
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{snapshot.fullGraphStats.nodes}</span>
              <span className={styles.statLabel}>Entities</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{snapshot.fullGraphStats.edges}</span>
              <span className={styles.statLabel}>Relations</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{Math.round(snapshot.answer.confidence * 100)}%</span>
              <span className={styles.statLabel}>Confidence</span>
            </div>
          </div>
        </aside>

        <section className={styles.panel}>
          <div className={styles.tabs}>
            {(
              [
                ['answer', 'Graph RAG answer'],
                ['graph', 'Knowledge graph'],
                ['compliance', 'Ontology compliance'],
                ['lineage', 'Decision lineage'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`${styles.tab} ${tab === id ? styles.tabActive : ''}`}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'answer' && (
            <>
              <div className={styles.answerBox}>
                <div className={styles.answerMeta}>
                  <span>Provenance hops: {snapshot.answer.hops.length}</span>
                  <span>Confidence {snapshot.answer.confidence}</span>
                </div>
                <p className={styles.answerText}>{snapshot.answer.answer}</p>
              </div>
              <h3 className={styles.panelTitle}>Evidence from connected records</h3>
              <div className={styles.evidenceList}>
                {snapshot.answer.evidence.map((e) => (
                  <div key={e.nodeId} className={styles.evidenceItem}>
                    <div className={styles.itemTitle}>{e.label}</div>
                    <p className={styles.itemBody}>{e.excerpt}</p>
                  </div>
                ))}
              </div>
              <h3 className={styles.panelTitle} style={{ marginTop: '1.1rem' }}>
                Multi-hop path
              </h3>
              <div className={styles.pathList}>
                {snapshot.answer.pathLabels.map((p) => (
                  <div key={p} className={styles.pathItem}>
                    <p className={styles.itemBody}>{p}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'graph' && (
            <>
              <p className={styles.itemBody} style={{ marginBottom: '0.75rem' }}>
                Subgraph used for this answer — entities and predicates the agent is allowed to traverse.
              </p>
              <div className={styles.graphCanvas}>
                <svg className={styles.graphSvg} viewBox="0 0 720 340" role="img" aria-label="Knowledge graph">
                  {snapshot.graph.edges.map((e) => {
                    const a = positions[e.from];
                    const b = positions[e.to];
                    if (!a || !b) return null;
                    const mx = (a.x + b.x) / 2;
                    const my = (a.y + b.y) / 2;
                    return (
                      <g key={e.id}>
                        <line
                          x1={a.x}
                          y1={a.y}
                          x2={b.x}
                          y2={b.y}
                          className={`${styles.edgeLine} ${styles.pulse}`}
                        />
                        <text x={mx} y={my - 4} className={styles.edgeLabel}>
                          {e.predicate}
                        </text>
                      </g>
                    );
                  })}
                  {snapshot.graph.nodes.map((n) => {
                    const p = positions[n.id];
                    if (!p) return null;
                    const hot = snapshot.answer.hops.some((h) => h.nodeId === n.id);
                    return (
                      <g key={n.id}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={hot ? 28 : 24}
                          className={hot ? `${styles.nodeCircle} ${styles.nodeCircleHot}` : styles.nodeCircle}
                        />
                        <text x={p.x} y={p.y + 4} className={styles.nodeLabel}>
                          {n.label.length > 18 ? `${n.label.slice(0, 16)}…` : n.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
              <div className={styles.evidenceList} style={{ marginTop: '0.85rem' }}>
                {snapshot.answer.hops.map((h) => (
                  <div key={h.nodeId} className={styles.evidenceItem}>
                    <div className={styles.itemTitle}>
                      {h.kind}: {h.label}
                    </div>
                    <p className={styles.itemBody}>{h.via ? `via ${h.via}` : 'seed entity'}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'compliance' && (
            <>
              <div className={styles.stats} style={{ marginTop: 0, marginBottom: '1rem' }}>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{snapshot.compliance.covered}</span>
                  <span className={styles.statLabel}>Covered</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{snapshot.compliance.partial}</span>
                  <span className={styles.statLabel}>Partial</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{snapshot.compliance.gap}</span>
                  <span className={styles.statLabel}>Gaps</span>
                </div>
              </div>
              <div className={styles.gapList}>
                {snapshot.gaps.map((g) => (
                  <div key={g.obligationId} className={styles.gapItem}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                      <div className={styles.itemTitle}>{g.obligation}</div>
                      <span
                        className={`${styles.badge} ${
                          g.status === 'covered'
                            ? styles.badgeCovered
                            : g.status === 'partial'
                              ? styles.badgePartial
                              : styles.badgeGap
                        }`}
                      >
                        {g.status}
                      </span>
                    </div>
                    <p className={styles.itemBody}>
                      {g.framework} · mapped to {g.mappedTo.join(', ')}
                    </p>
                    {g.evidence && <p className={styles.itemBody} style={{ marginTop: 4 }}>{g.evidence}</p>}
                    {g.remediation && (
                      <p className={styles.itemBody} style={{ marginTop: 4, color: 'var(--sg-amber)' }}>
                        Fix: {g.remediation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'lineage' && snapshot.lineage && (
            <>
              <div className={styles.answerBox}>
                <div className={styles.answerMeta}>{snapshot.lineage.title}</div>
                <p className={styles.answerText}>{snapshot.lineage.summary}</p>
              </div>
              <div className={styles.lineageList}>
                {snapshot.lineage.steps.map((step, idx) => (
                  <div key={step.id} className={styles.lineageItem}>
                    <div className={styles.itemTitle}>
                      {idx + 1}. {step.action}
                    </div>
                    <p className={styles.itemBody}>
                      {step.at} · {step.actor}
                    </p>
                    <p className={styles.itemBody} style={{ marginTop: 4 }}>
                      Touched: {step.touched.join(' · ')}
                    </p>
                    <p className={styles.itemBody} style={{ marginTop: 4 }}>
                      Outcome: {step.outcome}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className={styles.footerCta}>
            <a href={DEMO_MAILTO} className={styles.linkBtn}>
              Book enterprise demo
            </a>
            <Link href="/workspace/knowledge/graph" className={styles.ghostBtn}>
              Open Knowledge Graph workspace
            </Link>
            <Link href="/workspace/trust" className={styles.ghostBtn}>
              Trust Engine
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
