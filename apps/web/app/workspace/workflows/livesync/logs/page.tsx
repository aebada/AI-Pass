'use client';

import { useEffect, useState } from 'react';
import { LiveSyncShell } from '../components/LiveSyncShell';
import styles from '../livesync.module.css';

export default function LogsPage() {
  const [logs, setLogs] = useState<unknown[]>([]);

  useEffect(() => {
    const load = () =>
      fetch('/api/v1/events/logs?limit=200').then((r) => r.json()).then((d) => setLogs(d.logs ?? []));
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <LiveSyncShell title="Logs" subtitle="Traceable event, workflow, agent, and queue logs">
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Time</th>
            <th>Level</th>
            <th>Type</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {(logs as Array<Record<string, string>>).map((l, i) => (
            <tr key={`${l.timestamp}-${i}`}>
              <td>{l.timestamp}</td>
              <td>{l.level}</td>
              <td>{l.execution_type}</td>
              <td>{l.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </LiveSyncShell>
  );
}
