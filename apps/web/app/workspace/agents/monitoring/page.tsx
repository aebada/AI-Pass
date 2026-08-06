'use client';

import { useEffect, useState } from 'react';
import styles from '../agents.module.css';

export default function AgentMonitoringPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const load = () => fetch('/api/v1/agents/monitoring').then((r) => r.json()).then(setData);
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const snapshot = data?.snapshot as Record<string, unknown> | undefined;

  return (
    <>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <p className={styles.statValue}>{String(snapshot?.executionCount ?? 0)}</p>
          <p className={styles.statLabel}>Executions</p>
        </div>
        <div className={styles.stat}>
          <p className={styles.statValue}>{String(snapshot?.runningCount ?? 0)}</p>
          <p className={styles.statLabel}>Running</p>
        </div>
        <div className={styles.stat}>
          <p className={styles.statValue}>{((Number(snapshot?.avgConfidence ?? 0)) * 100).toFixed(0)}%</p>
          <p className={styles.statLabel}>Avg Confidence</p>
        </div>
        <div className={styles.stat}>
          <p className={styles.statValue}>{String(snapshot?.avgLatencyMs ?? 0)}ms</p>
          <p className={styles.statLabel}>Avg Latency</p>
        </div>
        <div className={styles.stat}>
          <p className={styles.statValue}>{String(snapshot?.creditsConsumed ?? 0)}</p>
          <p className={styles.statLabel}>Credits</p>
        </div>
        <div className={styles.stat}>
          <p className={styles.statValue}>{String(snapshot?.health ?? '—')}</p>
          <p className={styles.statLabel}>Health</p>
        </div>
      </div>
      {data && <pre className={styles.output}>{JSON.stringify(data, null, 2)}</pre>}
    </>
  );
}
