'use client';

import { useState } from 'react';
import { LiveSyncShell } from '../components/LiveSyncShell';
import styles from '../livesync.module.css';

export default function AdminPage() {
  const [testResult, setTestResult] = useState<unknown>(null);

  const sendTest = async (eventType: string) => {
    const res = await fetch('/api/v1/events/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventType,
        payload: { demo: true, at: new Date().toISOString() },
        source: 'livesync-admin',
      }),
    });
    setTestResult(await res.json());
  };

  return (
    <LiveSyncShell title="Administration" subtitle="Test events, security stubs, and engine controls">
      <h3 style={{ fontSize: 14 }}>Send test events</h3>
      <div className={styles.actions}>
        <button type="button" className={styles.primaryButton} onClick={() => sendTest('invoice.uploaded')}>
          invoice.uploaded
        </button>
        <button type="button" onClick={() => sendTest('marketplace.installed')}>marketplace.installed</button>
        <button type="button" onClick={() => sendTest('compliance.risk.created')}>compliance.risk.created</button>
        <button type="button" onClick={() => sendTest('custom.demo')}>custom.demo</button>
      </div>
      {testResult && <pre className={styles.raw} style={{ marginTop: 16 }}>{JSON.stringify(testResult, null, 2)}</pre>}

      <h3 style={{ fontSize: 14, marginTop: 32 }}>Security (stubs)</h3>
      <ul style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.8 }}>
        <li>RBAC - roles: admin, events:write</li>
        <li>Tenant isolation - X-Tenant-Id header</li>
        <li>Signed webhooks - LIVESYNC_WEBHOOK_SECRET</li>
        <li>Rate limiting - 120 req/min per tenant</li>
        <li>Replay protection - X-Idempotency-Key</li>
        <li>Audit logs - in-engine security service</li>
      </ul>

      <h3 style={{ fontSize: 14, marginTop: 24 }}>DevOps</h3>
      <p style={{ fontSize: 13, color: '#8b949e' }}>
        Redis: see docs/LIVESYNC-ENGINE.md for docker-compose snippet.
        Health: /api/v1/health · Queue: /api/v1/queue
      </p>
    </LiveSyncShell>
  );
}
