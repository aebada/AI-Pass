'use client';

import { useEffect, useMemo, useState } from 'react';
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
import {
  compileBusinessRule,
  mergeCompiledRules,
  previewBusinessRule,
  type CompiledRule,
} from '../lib/rule-to-graph';
import styles from './demo.module.css';

const EXAMPLE_RULES = [
  'If vibration exceeds 12 mm/s on VE-991, open a work order and require a second source.',
  'Auditor may read evidence and policy. Operator may not see invoices.',
  'Lot L-19920 cannot ship without quality sign-off.',
  'Stop Line 3 when a second source is missing.',
];

const LAYER_COLOR: Record<string, string> = {
  conceptual: '#8b6bff',
  assertional: '#673de6',
  inferential: '#00b090',
  provenance: '#ff9f1a',
  policy: '#e11d48',
};

export function DemoStudio() {
  const base = DEMO_SCENARIOS[0];
  const [role, setRole] = useState<OrgRole>('quality_engineer');
  const [selectedId, setSelectedId] = useState('ve-991');
  const [questionId, setQuestionId] = useState(base.questions[0].id);
  const [ruleText, setRuleText] = useState('');
  const [committed, setCommitted] = useState<CompiledRule[]>([]);

  const withCommitted = useMemo(() => mergeCompiledRules(base, committed), [base, committed]);
  const preview = useMemo(() => previewBusinessRule(ruleText, withCommitted), [ruleText, withCommitted]);
  const draft = useMemo(
    () => compileBusinessRule(ruleText, withCommitted, { draft: true, index: committed.length }),
    [ruleText, withCommitted, committed.length],
  );
  const scenario = useMemo(
    () => (draft ? mergeCompiledRules(withCommitted, [draft]) : withCommitted),
    [withCommitted, draft],
  );

  const visibleNodes = useMemo(() => nodesForRole(scenario, role), [scenario, role]);
  const visibleEdges = useMemo(() => edgesForRole(scenario, role), [scenario, role]);
  const selected = visibleNodes.find((node) => node.id === selectedId) ?? visibleNodes[0];
  const question = scenario.questions.find((item) => item.id === questionId) ?? scenario.questions[0];
  const hopSet = new Set(question.hopIds);
  const stats = graphStats(scenario);
  const roleMeta = ORG_ROLES.find((item) => item.id === role);
  const draftIds = new Set(draft?.nodes.map((node) => node.id) ?? []);
  const draftEdgeIds = new Set(draft?.edges.map((edge) => edge.id) ?? []);

  useEffect(() => {
    if (draft?.id) {
      setSelectedId(draft.id);
    }
  }, [draft?.id]);

  function selectNode(node: GraphNode) {
    setSelectedId(node.id);
  }

  function addRule() {
    if (!draft) return;
    const committedRule = compileBusinessRule(ruleText, withCommitted, {
      draft: false,
      index: committed.length,
    });
    if (!committedRule) return;
    setCommitted((current) => [...current, committedRule]);
    setSelectedId(committedRule.id);
    setRuleText('');
  }

  return (
    <div className={styles.studio}>
      <section className={styles.toolbar}>
        <div>
          <p className={styles.kicker}>Self-serve interactive demo</p>
          <h1>Full knowledge graph — nodes, attributes, metadata</h1>
          <p className={styles.lead}>
            Switch the human role. Type a business rule and the graph updates as you type.
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

      <section className={styles.composer} aria-labelledby="rule-heading">
        <div>
          <p className={styles.kicker}>
            Human business rule
            {draft ? <span className={styles.liveBadge}>Live</span> : null}
          </p>
          <h2 id="rule-heading">Type a rule. The knowledge graph updates in real time.</h2>
          <p className={styles.lead}>
            Encode what a quality, plant, audit, or operator person already knows. Nodes, thresholds,
            roles, and edges appear as you type — then commit them into the live graph.
          </p>
        </div>
        <div>
          <label htmlFor="human-rule">Human expertise</label>
          <textarea
            id="human-rule"
            rows={4}
            value={ruleText}
            onChange={(event) => setRuleText(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                event.preventDefault();
                addRule();
              }
            }}
            placeholder="If vibration exceeds 12 mm/s on VE-991, open a work order and require a second source."
          />
          <div className={styles.tokens} aria-live="polite">
            {preview.entities.map((item) => (
              <span key={`ent-${item.id}`} className={styles.tokenEntity}>
                {item.label}
              </span>
            ))}
            {preview.roles.map((item) => (
              <span key={`role-${item}`} className={styles.tokenRole}>
                {item.replaceAll('_', ' ')}
              </span>
            ))}
            {preview.actions.map((item) => (
              <span key={`act-${item.action}`} className={styles.tokenAction}>
                {item.action}
              </span>
            ))}
            {preview.threshold ? (
              <span className={styles.tokenThreshold}>
                {preview.threshold.metric} {preview.threshold.operator} {preview.threshold.value}
              </span>
            ) : null}
            {!preview.ready ? (
              <span className={styles.tokenHint}>Tokens appear as the sentence is recognized.</span>
            ) : null}
          </div>
          <div className={styles.composerActions}>
            <button type="button" className={styles.addRule} onClick={addRule} disabled={!draft}>
              Add rule to graph
            </button>
            <p>{draft ? draft.summary : 'Keep typing. A live draft node starts on the first recognized phrase.'}</p>
          </div>
          <div className={styles.examples}>
            {EXAMPLE_RULES.map((example) => (
              <button key={example} type="button" onClick={() => setRuleText(example)}>
                {example}
              </button>
            ))}
          </div>
          {committed.length ? (
            <ol className={styles.ruleList}>
              {committed.map((rule, index) => (
                <li key={`${rule.id}-${index}`}>
                  <strong>R{index + 1}.</strong> {rule.text}
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      </section>

      <div className={styles.layers}>
        {Object.entries(LAYER_COLOR).map(([layer, color]) => (
          <span key={layer}>
            <i style={{ background: color }} />
            {layer}
          </span>
        ))}
        <span>
          <i className={styles.draftSwatch} />
          live draft
        </span>
      </div>

      <div className={styles.board}>
        <svg viewBox="0 0 1000 620" className={styles.graph} role="img" aria-label="Knowledge graph">
          {visibleEdges.map((edge) => {
            const from = visibleNodes.find((node) => node.id === edge.from);
            const to = visibleNodes.find((node) => node.id === edge.to);
            if (!from || !to) return null;
            const active = hopSet.has(edge.id);
            const isDraft = draftEdgeIds.has(edge.id);
            return (
              <g key={edge.id}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={isDraft ? '#5025d1' : active ? '#673de6' : '#d5d5e2'}
                  strokeWidth={isDraft || active ? 2.4 : 1.2}
                  strokeDasharray={isDraft ? '6 4' : undefined}
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
                stroke={draftIds.has(node.id) ? '#5025d1' : selected?.id === node.id ? '#16171a' : '#fff'}
                strokeWidth={draftIds.has(node.id) ? 3 : 2}
                strokeDasharray={draftIds.has(node.id) ? '4 3' : undefined}
              />
              <text
                x={node.x}
                y={node.y + 28}
                textAnchor="middle"
                fontSize="11"
                fontWeight={700}
                fontFamily="Arial, Helvetica, sans-serif"
                fill="#16171a"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>

        {selected ? (
          <aside className={styles.inspector}>
            <p className={styles.kicker}>
              {selected.layer} · {selected.type}
              {draftIds.has(selected.id) ? <span className={styles.liveBadge}>Draft</span> : null}
            </p>
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
        {draft ? (
          <p className={styles.livePath}>
            <strong>Live human rule: </strong>
            {draft.summary}
          </p>
        ) : null}
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
          {draft?.edges.map((edge) => {
            const from = scenario.nodes.find((item) => item.id === edge.from);
            const to = scenario.nodes.find((item) => item.id === edge.to);
            return (
              <li key={edge.id} className={styles.draftHop}>
                {from?.label} — {edge.predicate} → {to?.label} (human, live)
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
