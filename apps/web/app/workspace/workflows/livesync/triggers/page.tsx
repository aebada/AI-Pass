'use client';

import { useEffect, useState } from 'react';
import { LiveSyncShell } from '../components/LiveSyncShell';
import styles from '../livesync.module.css';

export default function TriggersPage() {
  const [triggers, setTriggers] = useState<unknown[]>([]);

  useEffect(() => {
    fetch('/api/v1/livesync/triggers')
      .then((r) => r.json())
      .then((d) => setTriggers(d.triggers ?? []));
  }, []);

  return (
    <LiveSyncShell title="Triggers" subtitle="Event → workflow/agent/marketplace routing rules">
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Event Type</th>
            <th>Workflow</th>
            <th>Agent</th>
            <th>Target</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {(triggers as Array<Record<string, unknown>>).map((t) => (
            <tr key={String(t.id)}>
              <td>{String(t.event_type)}</td>
              <td>{String(t.workflow_id)}</td>
              <td>{String(t.agent_name ?? '-')}</td>
              <td>{String(t.target_type ?? 'workflow')}</td>
              <td>{t.is_active ? '✓' : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </LiveSyncShell>
  );
}
