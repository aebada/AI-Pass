'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DEMO_ORG_SLUG, DEMO_TRUST_CENTER } from '@ai-pass/compliance-ai';
import { ComplianceShell } from '../components/ComplianceShell';
import styles from '../compliance-ai.module.css';

export default function TrustCenterPage() {
  const tc = DEMO_TRUST_CENTER;
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState('');

  async function publish() {
    setPublishing(true);
    try {
      const res = await fetch('/api/v1/compliance-ai/trust-center/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-membership-tier': 'power' },
        body: JSON.stringify({ orgSlug: DEMO_ORG_SLUG, orgName: tc.orgName }),
      });
      const data = await res.json();
      setMessage(data.publicUrl ? `Published at ${data.publicUrl}` : data.error ?? 'Done');
    } catch {
      setMessage('Publish failed');
    } finally {
      setPublishing(false);
    }
  }

  return (
    <ComplianceShell>
      <p className={styles.hint}>Preview and publish your public Trust Center.</p>
      <div className={styles.grid}>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Trust Score</p>
          <p className={styles.statValue}>{tc.trustScore}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Status</p>
          <p className={styles.statValue} style={{ fontSize: 16, textTransform: 'capitalize' }}>{tc.status}</p>
        </div>
      </div>
      <div className={styles.card} style={{ marginTop: 16 }}>
        <p className={styles.cardTitle}>Frameworks</p>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13 }}>
          {tc.frameworks.map((f) => (
            <li key={f.code}>{f.code}: {f.status}</li>
          ))}
        </ul>
      </div>
      <div className={styles.card} style={{ marginTop: 16 }}>
        <p className={styles.cardTitle}>Commitments</p>
        {tc.commitments.map((c) => (
          <div key={c.id} style={{ marginBottom: 12 }}>
            <strong style={{ fontSize: 14 }}>{c.title}</strong>
            <p style={{ fontSize: 13, margin: '4px 0 0', opacity: 0.8 }}>{c.description}</p>
          </div>
        ))}
      </div>
      <div className={styles.actionRow}>
        <button type="button" className={styles.btnPrimary} onClick={publish} disabled={publishing}>
          {publishing ? 'Publishing…' : 'Publish Trust Center'}
        </button>
        <Link href={`/trust/${DEMO_ORG_SLUG}`} className={styles.btnPrimary}>Preview Public Page</Link>
      </div>
      {message && <p className={styles.hint}>{message}</p>}
    </ComplianceShell>
  );
}
