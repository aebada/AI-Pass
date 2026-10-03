'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import styles from '../research.module.css';
import {
  ArchitectureDiagram,
  DataRevolutionVisual,
  DeterministicModelsVisual,
  KnowledgeGraphVisual,
  PipelineFlow,
} from './visuals';

const TABS = [
  { id: 'stack', label: '1. The stack' },
  { id: 'data', label: '2. Data path' },
  { id: 'graph', label: '3. Knowledge graph' },
  { id: 'decide', label: '4. Deterministic path' },
  { id: 'loop', label: '5. Feedback loop' },
] as const;

export function LabPlayground() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('stack');
  const panel = useMemo(() => {
    if (tab === 'data') return <DataRevolutionVisual />;
    if (tab === 'graph') return <KnowledgeGraphVisual />;
    if (tab === 'decide') return <DeterministicModelsVisual />;
    if (tab === 'loop') return <PipelineFlow />;
    return <ArchitectureDiagram />;
  }, [tab]);

  return (
    <section className={styles.section} aria-labelledby="playground-heading">
      <h2 id="playground-heading">Interactive walkthrough</h2>
      <p className={styles.lead}>
        Five short pictures. No scores. Click a step, then try the live Graph RAG demo.
      </p>
      <div className={styles.tabs} role="tablist" aria-label="Walkthrough steps">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`${styles.tab} ${tab === item.id ? styles.tabOn : ''}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">{panel}</div>
      <div className={styles.ctaRow}>
        <Link className={styles.btnPrimary} href="/demo">
          Open the live demo
        </Link>
        <Link className={styles.btnSecondary} href="/research/ground">
          Read the Ground program
        </Link>
      </div>
    </section>
  );
}
