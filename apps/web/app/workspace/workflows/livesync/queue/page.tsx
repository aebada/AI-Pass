'use client';

import { useEffect, useState } from 'react';
import { LiveSyncShell, StatusBadge } from '../components/LiveSyncShell';
import styles from '../livesync.module.css';

export default function QueueMonitorPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const load = () => fetch('/api/v1/queue').then((r) => r.json()).then(setData);
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  const stats = data?.stats as Record<string, number> | undefined;
  const deadLetters = (data?.dead_letters as Array<Record<string, unknown>>) ?? [];

  return (
    <LiveSyncShell title="Queue Monitor" subtitle="FIFO, priority, delayed, and dead-letter queues">
      <div className={styles.grid}>
        {stats &&
          Object.entries(stats).map(([k, v]) => (
            <article key={k} className={styles.stat}>
              <h3>{k}</h3>
              <p className={styles.value}>{v}</p>
            </article>
          ))}
      </div>
      <p style={{ fontSize: 13, color: '#8b949e' }}>
        Redis stub: {data?.redis_connected ? 'connected (in-memory fallback)' : 'disconnected'}
      </p>
      <h3 style={{ fontSize: 14, marginTop: 24 }}>Dead letters</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Job</th>
            <th>Event</th>
            <th>Attempts</th>
          </tr>
        </thead>
        <tbody>
          {deadLetters.map((d) => (
            <tr key={String(d.job_id)}>
              <td>{String(d.job_id)}</td>
              <td>{String(d.event_id)}</td>
              <td>{String(d.attempts)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {data?.health && (
        <>
          <h3 style={{ fontSize: 14, marginTop: 24 }}>Health</h3>
          <StatusBadge status={String((data.health as Record<string, string>).status)} />
        </>
      )}
    </LiveSyncShell>
  );
}
