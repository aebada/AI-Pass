'use client';

import { useEffect, useState } from 'react';
import { ComplianceShell } from '../components/ComplianceShell';
import styles from '../compliance-ai.module.css';

export default function EvidencePage() {
  const [evidence, setEvidence] = useState<{ id: string; title: string; type: string; status: string; source: string; collectedAt?: string }[]>([]);
  const [summary, setSummary] = useState<{ collected: number; pending: number; validated: number } | null>(null);

  useEffect(() => {
    fetch('/api/v1/compliance-ai/evidence')
      .then((r) => r.json())
      .then((d) => {
        setEvidence(d.evidence ?? []);
        setSummary(d.summary ?? null);
      })
      .catch(() => {});
  }, []);

  return (
    <ComplianceShell>
      {summary && (
        <div className={styles.grid}>
          <div className={styles.card}><p className={styles.cardTitle}>Validated</p><p className={styles.statValue}>{summary.validated}</p></div>
          <div className={styles.card}><p className={styles.cardTitle}>Collected</p><p className={styles.statValue}>{summary.collected}</p></div>
          <div className={styles.card}><p className={styles.cardTitle}>Pending</p><p className={styles.statValue}>{summary.pending}</p></div>
        </div>
      )}
      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr><th>Evidence</th><th>Type</th><th>Source</th><th>Status</th><th>Collected</th></tr>
          </thead>
          <tbody>
            {evidence.map((e) => (
              <tr key={e.id}>
                <td>{e.title}</td>
                <td>{e.type}</td>
                <td>{e.source}</td>
                <td>{e.status}</td>
                <td>{e.collectedAt ? new Date(e.collectedAt).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ComplianceShell>
  );
}
