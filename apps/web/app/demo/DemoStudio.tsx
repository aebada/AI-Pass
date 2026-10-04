'use client';

import { useMemo, useState } from 'react';
import { DemoBookingForm } from '../components/DemoBookingForm';
import {
  DEMO_SCENARIOS,
  ORG_ROLES,
  edgesForRole,
  graphStats,
  nodesForRole,
  type GraphNode,
  type OrgRole,
} from '../lib/demo-graph';
import styles from './demo.module.css';

const LAYER_COLOR: Record<string, string> = {
  conceptual: '#8b6bff',
  assertional: '#673de6',
  inferential: '#00b090',
  provenance: '#ff9f1a',
  policy: '#e11d48',
};

export function DemoStudio() {
  const scenario = DEMO_SCENARIOS[0];
  const [role, setRole] = useState<OrgRole>('quality_engineer');
  const [selectedId, setSelectedId] = useState('ve-991');
  const [questionId, setQuestionId] = useState(scenario.questions[0].id);

  const visibleNodes = useMemo(() => nodesForRole(scenario, role), [scenario, role]);
  const visibleEdges = useMemo(() => edgesForRole(scenario, role), [scenario, role]);
  const selected = visibleNodes.find((node) => node.id === selectedId) ?? visibleNodes[0];
  const question = scenario.questions.find((item) => item.id === questionId) ?? scenario.questions[0];
  const hopSet = new Set(question.hopIds);
  const stats = graphStats(scenario);
  const roleMeta = ORG_ROLES.find((item) => item.id === role);

  function selectNode(node: GraphNode) {
    setSelectedId(node.id);
  }

  return (
    <div className={styles.studio}>
      <section className={styles.toolbar}>
        <div>
          <p className={styles.kicker}>Self-serve interactive demo</p>
          <h1>Full knowledge graph — nodes, attributes, metadata</h1>
          <p className={styles.lead}>
            Switch the human role. The same graph answers like that person, under organization rules.
            Decisions stay deterministic: same facts and same contract, same path.
          </p>
        </div>
        <dl className={styles.stats}>
          <div>
            <dt>Entities</dt>
            <dd>{stats.entities}</dd>
          </div>
          <div>
            <dt>Relationships</dt>
            <dd>{stats.relationships}</dd>
          </div>
          <div>
            <dt>Answer hops</dt>
            <dd>{stats.inferredAnswerHops}</dd>
          </div>
          <div>
            <dt>Policy rules</dt>
            <dd>{stats.rules}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.controls}>
        <label>
          Scenario
          <select value={scenario.id} disabled>
            <option>{scenario.name}</option>
          </select>
        </label>
        <label>
          Human role
          <select value={role} onChange={(e) => setRole(e.target.value as OrgRole)}>
            {ORG_ROLES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Question
          <select value={questionId} onChange={(e) => setQuestionId(e.target.value)}>
            {scenario.questions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.prompt}
              </option>
            ))}
          </select>
        </label>
        <p className={styles.roleBlurb}>{roleMeta?.blurb}</p>
      </section>

      <div className={styles.layers}>
        {Object.entries(LAYER_COLOR).map(([layer, color]) => (
          <span key={layer}>
            <i style={{ background: color }} />
            {layer}
          </span>
        ))}
      </div>

      <div className={styles.board}>
        <svg viewBox="0 0 1000 460" className={styles.graph} role="img" aria-label="Knowledge graph">
          {visibleEdges.map((edge) => {
            const from = visibleNodes.find((node) => node.id === edge.from);
            const to = visibleNodes.find((node) => node.id === edge.to);
            if (!from || !to) return null;
            const active = hopSet.has(edge.id);
            return (
              <g key={edge.id}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={active ? '#673de6' : '#d5d5e2'}
                  strokeWidth={active ? 2.4 : 1.2}
                />
                <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 6} fontSize="9" fill="#6b6d76">
                  {edge.predicate}
                </text>
              </g>
            );
          })}
          {visibleNodes.map((node) => (
            <g key={node.id} onClick={() => selectNode(node)} style={{ cursor: 'pointer' }}>
              <circle
                cx={node.x}
                cy={node.y}
                r={selected?.id === node.id ? 16 : 12}
                fill={LAYER_COLOR[node.layer]}
                stroke={selected?.id === node.id ? '#1d1e20' : '#fff'}
                strokeWidth={2}
              />
              <text x={node.x} y={node.y + 28} textAnchor="middle" fontSize="11" fontWeight={700}>
                {node.label}
              </text>
            </g>
          ))}
        </svg>

        {selected ? (
          <aside className={styles.inspector}>
            <p className={styles.kicker}>{selected.layer} · {selected.type}</p>
            <h2>{selected.label}</h2>
            <h3>Attributes</h3>
            <dl>
              {Object.entries(selected.attributes).map(([key, value]) => (
                <div key={key}>
                  <dt>{key}</dt>
                  <dd>{String(value)}</dd>
                </div>
              ))}
            </dl>
            <h3>Metadata</h3>
            <dl>
              <div>
                <dt>source</dt>
                <dd>{selected.metadata.source}</dd>
              </div>
              <div>
                <dt>capturedAt</dt>
                <dd>{selected.metadata.capturedAt}</dd>
              </div>
              <div>
                <dt>confidence</dt>
                <dd>{selected.metadata.confidence}</dd>
              </div>
              <div>
                <dt>classification</dt>
                <dd>{selected.metadata.classification}</dd>
              </div>
              <div>
                <dt>ownerRole</dt>
                <dd>{selected.metadata.ownerRole}</dd>
              </div>
              <div>
                <dt>version</dt>
                <dd>{selected.metadata.version}</dd>
              </div>
              {selected.metadata.checksum ? (
                <div>
                  <dt>checksum</dt>
                  <dd>{selected.metadata.checksum}</dd>
                </div>
              ) : null}
            </dl>
          </aside>
        ) : null}
      </div>

      <section className={styles.answer}>
        <h2>Deterministic explanation</h2>
        <p className={styles.answerLead}>{question.answer}</p>
        <p>
          <strong>Rule: </strong>
          {question.deterministicRule}
        </p>
        <p>{question.explanation}</p>
        <ol>
          {question.hopIds.map((hopId) => {
            const edge = scenario.edges.find((item) => item.id === hopId);
            if (!edge) return null;
            const from = scenario.nodes.find((node) => node.id === edge.from);
            const to = scenario.nodes.find((node) => node.id === edge.to);
            return (
              <li key={hopId}>
                {from?.label} — {edge.predicate} → {to?.label}
                {edge.metadata ? ` (${edge.metadata.source}, ${edge.metadata.confidence})` : ''}
              </li>
            );
          })}
        </ol>
      </section>

      <section className={styles.book} id="book-demo">
        <div>
          <p className={styles.kicker}>Book from the solution</p>
          <h2>Fill the form. The walkthrough uses your role.</h2>
          <p>
            Explainability, deterministic checks, and human role-based access are the product — not a
            slide. Submit the form here; we route it as a demo lead.
          </p>
        </div>
        <DemoBookingForm />
      </section>
    </div>
  );
}
