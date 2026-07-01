'use client';

import { useEffect, useState } from 'react';
import { ComplianceShell, SeverityBadge } from '../components/ComplianceShell';
import styles from '../compliance-ai.module.css';

export default function RisksPage() {
  const [risks, setRisks] = useState<{ id: string; title: string; category: string; severity: string; riskScore: number; ownerName: string; status: string; nextReviewAt: string }[]>([]);

  useEffect(() => {
    fetch('/api/v1/compliance-ai/risks').then((r) => r.json()).then((d) => setRisks(d.risks ?? [])).catch(() => {});
  }, []);

  return (
    <ComplianceShell>
      <p className={styles.hint}>Security, AI, privacy, vendor, operational, and compliance risks with control mapping.</p>
      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr><th>Risk</th><th>Category</th><th>Severity</th><th>Score</th><th>Owner</th><th>Status</th><th>Next Review</th></tr>
          </thead>
          <tbody>
            {risks.map((r) => (
              <tr key={r.id}>
                <td>{r.title}</td>
                <td>{r.category}</td>
                <td><SeverityBadge severity={r.severity} /></td>
                <td>{r.riskScore}</td>
                <td>{r.ownerName}</td>
                <td>{r.status}</td>
                <td>{new Date(r.nextReviewAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ComplianceShell>
  );
}
