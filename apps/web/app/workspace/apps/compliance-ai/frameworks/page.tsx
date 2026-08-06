'use client';

import { useEffect, useState } from 'react';
import { ComplianceShell } from '../components/ComplianceShell';
import styles from '../compliance-ai.module.css';

interface Framework {
  id: string;
  code: string;
  name: string;
  progress: number;
  active: boolean;
  ownerName: string;
  targetCertificationDate?: string;
}

export default function FrameworksPage() {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [catalog, setCatalog] = useState<Framework[]>([]);

  useEffect(() => {
    fetch('/api/v1/compliance-ai/frameworks')
      .then((r) => r.json())
      .then((d) => {
        setFrameworks(d.frameworks ?? []);
        setCatalog(d.catalog ?? []);
      })
      .catch(() => {});
  }, []);

  return (
    <ComplianceShell>
      <p className={styles.hint}>Activate and track ISO 27001, ISO 42001, SOC2, GDPR, NIS2, DORA, TISAX, and more.</p>
      <div className={styles.card}>
        <p className={styles.cardTitle}>Active Frameworks</p>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Framework</th>
              <th>Progress</th>
              <th>Owner</th>
              <th>Target</th>
            </tr>
          </thead>
          <tbody>
            {frameworks.map((f) => (
              <tr key={f.id}>
                <td><strong>{f.name}</strong> ({f.code})</td>
                <td>{f.progress}%</td>
                <td>{f.ownerName}</td>
                <td>{f.targetCertificationDate ? new Date(f.targetCertificationDate).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.card} style={{ marginTop: 16 }}>
        <p className={styles.cardTitle}>Available Frameworks</p>
        <table className={styles.table}>
          <thead>
            <tr><th>Code</th><th>Name</th><th>Status</th></tr>
          </thead>
          <tbody>
            {catalog.map((f) => (
              <tr key={f.code}>
                <td>{f.code}</td>
                <td>{f.name}</td>
                <td>{f.active ? 'Active' : 'Available'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ComplianceShell>
  );
}
