'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { LiveSyncShell, StatusBadge } from '../../components/LiveSyncShell';
import styles from '../../livesync.module.css';

export default function EventDetailPage() {
  const params = useParams();
  const eventId = String(params.id);
  const [event, setEvent] = useState<Record<string, unknown> | null>(null);
  const [logs, setLogs] = useState<unknown[]>([]);

  useEffect(() => {
    fetch(`/api/v1/events/${eventId}`).then((r) => r.json()).then(setEvent);
    fetch(`/api/v1/events/logs?event_id=${eventId}`).then((r) => r.json()).then((d) => setLogs(d.logs ?? []));
  }, [eventId]);

  const retry = async () => {
    await fetch('/api/v1/events/retry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: eventId }),
    });
  };

  const replay = async () => {
    await fetch('/api/v1/events/replay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: eventId }),
    });
  };

  return (
    <LiveSyncShell title="Event Detail" subtitle={eventId}>
      {event && (
        <>
          <div className={styles.grid}>
            <article className={styles.stat}>
              <h3>Type</h3>
              <p className={styles.value} style={{ fontSize: 16 }}>{String(event.event_type)}</p>
            </article>
            <article className={styles.stat}>
              <h3>Status</h3>
              <p className={styles.value} style={{ fontSize: 16 }}>
                <StatusBadge status={String(event.status)} />
              </p>
            </article>
            <article className={styles.stat}>
              <h3>Source</h3>
              <p className={styles.value} style={{ fontSize: 16 }}>{String(event.source)}</p>
            </article>
          </div>
          <pre className={styles.raw}>{JSON.stringify(event, null, 2)}</pre>
          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={retry}>Retry</button>
            <button type="button" onClick={replay}>Replay</button>
          </div>
          <h3 style={{ marginTop: 24, fontSize: 14 }}>Event logs</h3>
          <pre className={styles.raw}>{JSON.stringify(logs, null, 2)}</pre>
        </>
      )}
    </LiveSyncShell>
  );
}
