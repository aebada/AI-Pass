'use client';

import { useEffect, useState } from 'react';
import { ComplianceShell } from '../components/ComplianceShell';
import styles from '../compliance-ai.module.css';

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<{ id: string; title: string; status: string; templateType?: string; acceptanceRate: number; ownerName: string }[]>([]);

  useEffect(() => {
    fetch('/api/v1/compliance-ai/policies').then((r) => r.json()).then((d) => setPolicies(d.policies ?? [])).catch(() => {});
  }, []);

  return (
    <ComplianceShell>
      <p className={styles.hint}>Create, version, approve, publish, and track policy acceptance.</p>
      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr><th>Policy</th><th>Template</th><th>Status</th><th>Acceptance</th><th>Owner</th></tr>
          </thead>
          <tbody>
            {policies.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{p.templateType?.replace(/_/g, ' ') ?? '-'}</td>
                <td>{p.status}</td>
                <td>{p.acceptanceRate}%</td>
                <td>{p.ownerName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ComplianceShell>
  );
}
