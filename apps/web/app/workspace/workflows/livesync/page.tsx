'use client';

import { useEffect, useState } from 'react';
import { LiveSyncShell, StatusBadge } from './components/LiveSyncShell';
import styles from './livesync.module.css';

interface StreamMessage {
  topic: string;
  timestamp: string;
  payload: Record<string, unknown>;
}

export default function LiveSyncDashboardPage() {
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [metrics, setMetrics] = useState<Record<string, unknown> | null>(null);
  const [stream, setStream] = useState<StreamMessage[]>([]);
  const [executions, setExecutions] = useState<unknown[]>([]);

  useEffect(() => {
    const load = () => {
      fetch('/api/v1/health').then((r) => r.json()).then(setHealth);
      fetch('/api/v1/livesync/metrics').then((r) => r.json()).then(setMetrics);
      fetch('/api/v1/events?limit=10').then((r) => r.json()).then((d) => setExecutions(d.events ?? []));
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const es = new EventSource('/api/v1/events/stream');
    es.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data) as StreamMessage;
        setStream((prev) => [msg, ...prev].slice(0, 50));
      } catch {
        /* ignore heartbeat */
      }
    };
    return () => es.close();
  }, []);

  const m = metrics?.metrics as Record<string, number> | undefined;
  const q = metrics?.queue as Record<string, number> | undefined;

  return (
    <LiveSyncShell title="LiveSync" subtitle="Event stream, queue status, and processing metrics">
      <div className={styles.grid}>
        <article className={styles.stat}>
          <h3>Engine Status</h3>
          <p className={styles.value}>{String(health?.status ?? '-')}</p>
          <StatusBadge status={String(health?.queue ?? 'unknown')} />
        </article>
        <article className={styles.stat}>
          <h3>EPS</h3>
          <p className={styles.value}>{m?.eventsPerSecond?.toFixed(1) ?? 0}</p>
        </article>
        <article className={styles.stat}>
          <h3>Queue Depth</h3>
          <p className={styles.value}>{q?.pending ?? health?.pending_events ?? 0}</p>
        </article>
        <article className={styles.stat}>
          <h3>Avg Latency</h3>
          <p className={styles.value}>{m?.avgProcessingMs ?? 0}ms</p>
        </article>
        <article className={styles.stat}>
          <h3>Dead Letters</h3>
          <p className={styles.value}>{m?.deadLetterCount ?? 0}</p>
        </article>
        <article className={styles.stat}>
          <h3>Failure Rate</h3>
          <p className={styles.value}>{((m?.failureRate ?? 0) * 100).toFixed(1)}%</p>
        </article>
      </div>

      <h3 style={{ fontSize: 14, marginBottom: 8 }}>Real-time event stream (SSE)</h3>
      <div className={styles.stream}>
        {stream.length === 0 && (
          <div className={styles.streamItem} style={{ color: '#8b949e' }}>
            Waiting for events…
          </div>
        )}
        {stream.map((msg, i) => (
          <div key={`${msg.timestamp}-${i}`} className={styles.streamItem}>
            <strong>{msg.topic}</strong>
            <span style={{ marginLeft: 8, color: '#8b949e' }}>{msg.timestamp}</span>
            <pre style={{ margin: '4px 0 0', fontSize: 11, overflow: 'hidden' }}>
              {JSON.stringify(msg.payload).slice(0, 120)}
            </pre>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: 14, margin: '24px 0 8px' }}>Recent events</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Type</th>
            <th>Source</th>
            <th>Status</th>
            <th>Received</th>
          </tr>
        </thead>
        <tbody>
          {(executions as Array<Record<string, string>>).map((e) => (
            <tr key={e.id}>
              <td>{e.event_type}</td>
              <td>{e.source}</td>
              <td><StatusBadge status={e.status} /></td>
              <td>{e.received_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </LiveSyncShell>
  );
}
