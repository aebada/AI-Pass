'use client';

import { useEffect, useState } from 'react';
import { LiveSyncShell } from '../components/LiveSyncShell';
import styles from '../livesync.module.css';

export default function ReplayConsolePage() {
  const [eventId, setEventId] = useState('');
  const [jobId, setJobId] = useState('');
  const [result, setResult] = useState<unknown>(null);
  const [deadLetters, setDeadLetters] = useState<unknown[]>([]);

  useEffect(() => {
    fetch('/api/v1/queue').then((r) => r.json()).then((d) => setDeadLetters(d.dead_letters ?? []));
  }, [result]);

  const replayEvent = async () => {
    const res = await fetch('/api/v1/events/replay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: eventId }),
    });
    setResult(await res.json());
  };

  const replayJob = async () => {
    const res = await fetch('/api/v1/events/replay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId }),
    });
    setResult(await res.json());
  };

  return (
    <LiveSyncShell title="Replay Console" subtitle="Retry failed events or replay dead-letter jobs">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
        <label style={{ fontSize: 13 }}>
          Event ID
          <input
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            style={{ display: 'block', width: '100%', marginTop: 4, padding: 8, borderRadius: 8 }}
          />
        </label>
        <button type="button" className={styles.primaryButton} onClick={replayEvent}>
          Replay Event
        </button>
        <label style={{ fontSize: 13 }}>
          Dead-letter Job ID
          <input
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            style={{ display: 'block', width: '100%', marginTop: 4, padding: 8, borderRadius: 8 }}
          />
        </label>
        <button type="button" onClick={replayJob} style={{ padding: 8, borderRadius: 8 }}>
          Replay Dead Letter
        </button>
      </div>
      {result && <pre className={styles.raw} style={{ marginTop: 24 }}>{JSON.stringify(result, null, 2)}</pre>}
      <h3 style={{ marginTop: 24, fontSize: 14 }}>Dead letters</h3>
      <pre className={styles.raw}>{JSON.stringify(deadLetters, null, 2)}</pre>
    </LiveSyncShell>
  );
}
