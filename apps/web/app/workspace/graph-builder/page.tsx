'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import {
  DOMAIN_PACKS,
  PIPELINE_STAGES,
  SEATS,
  type DomainPack,
  type JudgedTriple,
  type PackId,
  runJudgedBuild,
  searchEvidence,
} from '../../lib/graph-builder';
import styles from './graph-builder.module.css';

export default function GraphBuilderPage() {
  const [packs, setPacks] = useState(DOMAIN_PACKS);
  const [packId, setPackId] = useState<PackId>('enterprise-twin');
  const [doc, setDoc] = useState('');
  const [triples, setTriples] = useState<JudgedTriple[]>([]);
  const [stats, setStats] = useState<{ proposed: number; verified: number; review: number; rejected: number } | null>(
    null,
  );
  const [query, setQuery] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const pack = useMemo(
    () => packs.find((p) => p.id === packId) ?? packs[0]!,
    [packs, packId],
  );

  const hits = useMemo(() => searchEvidence(triples, query), [triples, query]);

  function approvePack() {
    setPacks((prev) => prev.map((p) => (p.id === packId ? { ...p, approved: true } : p)));
    setStep(2);
  }

  function buildGraph() {
    if (!pack.approved) return;
    const result = runJudgedBuild(pack, doc || undefined);
    setTriples(result.triples);
    setStats(result.stats);
    setStep(3);
  }

  function verdictClass(v: JudgedTriple['verdict']) {
    if (v === 'verified') return styles.verdictVerified;
    if (v === 'review') return styles.verdictReview;
    return styles.verdictRejected;
  }

  return (
    <WorkspaceLayoutClient
      title="Graph Builder"
      subtitle="Approve an ontology, then build a knowledge graph judged triple by triple — every fact keeps its evidence."
    >
      <div className={styles.wrap}>
        <section className={styles.hero}>
          <h2>Ontology-first GraphRAG, judged triple by triple</h2>
          <p>
            Human approves the ontology pack first. A proposer suggests facts. A decision judge
            weighs each candidate against its evidence span. Only verified edges land in the graph.
          </p>
          <div className={styles.seats}>
            {SEATS.map((seat) => (
              <div key={seat.id} className={styles.seat}>
                <strong>{seat.name}</strong>
                <span>{seat.copy}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.steps} aria-label="How to use Graph Builder">
          <article className={step === 1 ? styles.stepActive : styles.step}>
            <span className={styles.stepNum}>1</span>
            <h3>Approve ontology</h3>
            <p>Pick a domain pack. Flat types you can measure.</p>
          </article>
          <article className={step === 2 ? styles.stepActive : styles.step}>
            <span className={styles.stepNum}>2</span>
            <h3>Build graph</h3>
            <p>Paste documents. Pipeline judges every triple.</p>
          </article>
          <article className={step === 3 ? styles.stepActive : styles.step}>
            <span className={styles.stepNum}>3</span>
            <h3>Ask with evidence</h3>
            <p>Search returns facts with the source sentence.</p>
          </article>
        </section>

        <section className={styles.panel}>
          <h3>1) Choose and approve a pack</h3>
          <div className={styles.packGrid}>
            {packs.map((p: DomainPack) => (
              <button
                key={p.id}
                type="button"
                className={packId === p.id ? styles.packSelected : styles.pack}
                onClick={() => {
                  setPackId(p.id);
                  setStep(1);
                }}
              >
                <h4>{p.name}</h4>
                <p>{p.summary}</p>
                {p.approved ? <span className={styles.badge}>Approved</span> : null}
              </button>
            ))}
          </div>
          <p style={{ margin: '0.85rem 0', color: '#5c5f6b', fontSize: '0.88rem' }}>
            <strong>{pack.name}</strong>: {pack.entities.length} entity types · {pack.relations.length}{' '}
            relations
            {pack.entities[0] ? ` · e.g. “${pack.entities[0].label}” — ${pack.entities[0].definition}` : ''}
          </p>
          <button type="button" className={styles.btn} onClick={approvePack}>
            {pack.approved ? 'Pack approved — continue' : 'Approve ontology pack'}
          </button>
        </section>

        <section className={styles.panel}>
          <h3>2) Build from documents</h3>
          <textarea
            className={styles.textarea}
            value={doc}
            onChange={(e) => setDoc(e.target.value)}
            placeholder="Paste contracts, SOPs, or notes — or leave blank to use a sample for this pack."
          />
          <div className={styles.pipeline} aria-label="Pipeline stages">
            {PIPELINE_STAGES.map((s) => (
              <span key={s.id} className={styles.pipe} title={s.copy}>
                {s.label}
              </span>
            ))}
          </div>
          <button type="button" className={styles.btn} disabled={!pack.approved} onClick={buildGraph}>
            Build judged graph
          </button>
        </section>

        {stats ? (
          <section className={styles.panel}>
            <h3>3) Graph + evidence search</h3>
            <div className={styles.stats}>
              <span>
                Proposed <strong>{stats.proposed}</strong>
              </span>
              <span>
                Verified <strong>{stats.verified}</strong>
              </span>
              <span>
                Review <strong>{stats.review}</strong>
              </span>
              <span>
                Rejected <strong>{stats.rejected}</strong>
              </span>
            </div>
            <div className={styles.searchRow}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search facts — e.g. payment, Term, employs"
                aria-label="Search evidence"
              />
              <button type="button" className={styles.btnGhost} onClick={() => setQuery('')}>
                Clear
              </button>
            </div>
            <div className={styles.tripleList}>
              {hits.map((t) => (
                <article key={t.id} className={styles.triple}>
                  <div className={styles.tripleHead}>
                    <span>
                      {t.subject} — {t.predicate} → {t.object}
                    </span>
                    <span className={verdictClass(t.verdict)}>
                      {t.verdict} · {t.confidence}
                    </span>
                  </div>
                  <p className={styles.tripleEvidence}>“{t.evidence}”</p>
                </article>
              ))}
              {hits.length === 0 ? (
                <p style={{ color: '#5c5f6b', fontSize: '0.88rem' }}>No matching verified/review facts.</p>
              ) : null}
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Link href="/workspace/knowledge/ontology" className={styles.btnGhost}>
                Open Ontology Studio
              </Link>
              <Link href="/workspace/knowledge/graph" className={styles.btnGhost}>
                Open knowledge graph
              </Link>
              <Link href="/workspace/connect" className={styles.btn}>
                Connect more sources
              </Link>
            </div>
          </section>
        ) : null}
      </div>
    </WorkspaceLayoutClient>
  );
}
