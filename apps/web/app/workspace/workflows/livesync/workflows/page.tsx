'use client';

import { useEffect, useState } from 'react';
import { LiveSyncShell, StatusBadge } from '../components/LiveSyncShell';
import styles from '../livesync.module.css';

export default function WorkflowMonitorPage() {
  const [workflows, setWorkflows] = useState<unknown[]>([]);
  const [events, setEvents] = useState<unknown[]>([]);

  useEffect(() => {
    fetch('/api/v1/livesync/triggers').then((r) => r.json()).then((d) => setWorkflows(d.workflows ?? []));
    fetch('/api/v1/events?limit=20').then((r) => r.json()).then((d) => setEvents(d.events ?? []));
  }, []);

  const running = (events as Array<Record<string, string>>).filter(
    (e) => e.status === 'processing' || e.status === 'queued'
  );

  return (
    <LiveSyncShell title="Workflow Monitor" subtitle="Workflow executions driven by LiveSync">
      <div className={styles.grid}>
        <article className={styles.stat}>
          <h3>Definitions</h3>
          <p className={styles.value}>{workflows.length}</p>
        </article>
        <article className={styles.stat}>
          <h3>In Flight</h3>
          <p className={styles.value}>{running.length}</p>
        </article>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Workflow</th>
            <th>Description</th>
            <th>Steps</th>
          </tr>
        </thead>
        <tbody>
          {(workflows as Array<Record<string, unknown>>).map((w) => (
            <tr key={String(w.id)}>
              <td>{String(w.name)}</td>
              <td>{String(w.description ?? '')}</td>
              <td>{Array.isArray(w.steps) ? w.steps.length : 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3 style={{ marginTop: 24, fontSize: 14 }}>Recent workflow-triggering events</h3>
      <table className={styles.table}>
        <thead>
          <tr><th>Type</th><th>Status</th><th>Time</th></tr>
        </thead>
        <tbody>
          {(events as Array<Record<string, string>>).map((e) => (
            <tr key={e.id}>
              <td>{e.event_type}</td>
              <td><StatusBadge status={e.status} /></td>
              <td>{e.received_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </LiveSyncShell>
  );
}
