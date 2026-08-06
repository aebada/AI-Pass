'use client';

import Link from 'next/link';
import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BENCHMARK_SUITES, MODEL_REGISTRY, compareModels, getBenchmarkScores } from '@ai-pass/model-hub';
import styles from '../model-hub.module.css';

function Content() {
  const searchParams = useSearchParams();
  const initial = searchParams.get('compare')?.split(',').filter(Boolean) ?? [];
  const [modelA, setModelA] = useState(initial[0] ?? 'gpt-4o');
  const [modelB, setModelB] = useState(initial[1] ?? 'claude-sonnet-4');
  const [suite, setSuite] = useState('mmlu');
  const comparison = useMemo(() => compareModels([modelA, modelB]), [modelA, modelB]);
  const scores = useMemo(() => getBenchmarkScores([modelA, modelB], suite), [modelA, modelB, suite]);

  return (
    <>
      <div className={styles.filters}>
        <select className={styles.filterSelect} value={modelA} onChange={(e) => setModelA(e.target.value)}>
          {MODEL_REGISTRY.map((m) => (
            <option key={m.id} value={m.id}>{m.displayName}</option>
          ))}
        </select>
        <select className={styles.filterSelect} value={modelB} onChange={(e) => setModelB(e.target.value)}>
          {MODEL_REGISTRY.map((m) => (
            <option key={m.id} value={m.id}>{m.displayName}</option>
          ))}
        </select>
        <select className={styles.filterSelect} value={suite} onChange={(e) => setSuite(e.target.value)}>
          {BENCHMARK_SUITES.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <p className={styles.cardDesc}>{comparison.summary}</p>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Dimension</th>
            {comparison.models.map((m) => (
              <th key={m.id}>{m.displayName}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparison.dimensions.map((dim) => (
            <tr key={dim.key}>
              <td>{dim.label}</td>
              {comparison.models.map((m) => (
                <td key={m.id}>{String(dim.values[m.id])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.meta} style={{ marginTop: 12 }}>
        {scores.map((s) => (
          <span key={s.modelId}>{s.displayName}: {s.score}</span>
        ))}
      </div>
      <Link href="/workspace/model-hub" className={styles.btn} style={{ marginTop: 12, display: 'inline-block' }}>
        Back
      </Link>
    </>
  );
}

export default function BenchmarksPage() {
  return (
    <Suspense fallback={<div className={styles.empty}>Loading…</div>}>
      <Content />
    </Suspense>
  );
}
