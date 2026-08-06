'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LiveSyncShell, StatusBadge } from '../components/LiveSyncShell';
import styles from '../livesync.module.css';

export default function EventsListPage() {
  const [events, setEvents] = useState<Array<Record<string, string>>>([]);

  useEffect(() => {
    fetch('/api/v1/events?limit=100')
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []));
  }, []);

  return (
    <LiveSyncShell title="Events" subtitle="All ingested LiveSync events">
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Source</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Received</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id}>
              <td>
                <Link href={`/workspace/workflows/livesync/events/${e.id}`}>{e.id.slice(0, 16)}…</Link>
              </td>
              <td>{e.event_type}</td>
              <td>{e.source}</td>
              <td>{e.priority ?? 'normal'}</td>
              <td><StatusBadge status={e.status} /></td>
              <td>{e.received_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </LiveSyncShell>
  );
}
