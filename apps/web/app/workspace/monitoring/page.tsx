'use client';

import { useEffect, useState } from 'react';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import styles from './monitoring.module.css';

export default function MonitoringPage() {
  const [metrics, setMetrics] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch('/api/v1/runtime/metrics')
      .then((r) => r.json())
      .then(setMetrics);
    const interval = setInterval(() => {
      fetch('/api/v1/runtime/metrics').then((r) => r.json()).then(setMetrics);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const runtime = metrics?.runtime as Record<string, unknown> | undefined;
  const exec = runtime?.executions as Record<string, number> | undefined;
  const credits = runtime?.credits as Record<string, number> | undefined;

  return (
    <WorkspaceLayoutClient title="Monitoring" subtitle="Credits, latency, provider health, confidence, and trust metrics">
      <div className={styles.grid}>
        <article className={styles.stat}>
          <h3>Executions</h3>
          <p className={styles.value}>{exec?.total ?? 0}</p>
          <span>{exec?.completed ?? 0} completed · {exec?.needsInfo ?? 0} needs info</span>
        </article>
        <article className={styles.stat}>
          <h3>Avg Confidence</h3>
          <p className={styles.value}>{((exec?.avgConfidence ?? 0) * 100).toFixed(0)}%</p>
        </article>
        <article className={styles.stat}>
          <h3>Avg Latency</h3>
          <p className={styles.value}>{exec?.avgLatencyMs ?? 0}ms</p>
        </article>
        <article className={styles.stat}>
          <h3>Credits (1h)</h3>
          <p className={styles.value}>{credits?.lastHour ?? 0}</p>
          <span>{credits?.totalConsumed ?? 0} total</span>
        </article>
      </div>
      {metrics && (
        <pre className={styles.raw}>{JSON.stringify(metrics, null, 2)}</pre>
      )}
    </WorkspaceLayoutClient>
  );
}
