'use client';

import { useEffect, useState } from 'react';
import { LiveSyncShell } from '../components/LiveSyncShell';
import styles from '../livesync.module.css';

export default function LiveSyncMonitoringPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const load = () => fetch('/api/v1/livesync/metrics').then((r) => r.json()).then(setData);
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <LiveSyncShell title="Monitoring" subtitle="EPS, throughput, latency, failures, retries">
      <pre className={styles.raw}>{JSON.stringify(data, null, 2)}</pre>
      <p style={{ fontSize: 13, marginTop: 16, color: '#8b949e' }}>
        Prometheus: <a href="/api/v1/livesync/metrics?format=prometheus">/api/v1/livesync/metrics?format=prometheus</a>
      </p>
    </LiveSyncShell>
  );
}
