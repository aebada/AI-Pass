'use client';

import { useEffect, useState } from 'react';
import { LiveSyncShell, StatusBadge } from '../components/LiveSyncShell';
import styles from '../livesync.module.css';

export default function AgentMonitorPage() {
  const [events, setEvents] = useState<unknown[]>([]);

  useEffect(() => {
    fetch('/api/v1/events?limit=30')
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []));
  }, []);

  const agentEvents = (events as Array<Record<string, string>>).filter(
    (e) => e.event_type.includes('agent') || e.source.includes('agent')
  );

  return (
    <LiveSyncShell title="Agent Monitor" subtitle="Agent executions via runtime-core evaluator">
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Event</th>
            <th>Source</th>
            <th>Status</th>
            <th>Received</th>
          </tr>
        </thead>
        <tbody>
          {agentEvents.map((e) => (
            <tr key={e.id}>
              <td>{e.event_type}</td>
              <td>{e.source}</td>
              <td><StatusBadge status={e.status} /></td>
              <td>{e.received_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {agentEvents.length === 0 && (
        <p style={{ color: '#8b949e', fontSize: 13 }}>No agent events yet — trigger via Execution or LiveSync test.</p>
      )}
    </LiveSyncShell>
  );
}
