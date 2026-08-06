'use client';

import { useEffect, useState } from 'react';
import { ComplianceShell } from '../components/ComplianceShell';
import styles from '../compliance-ai.module.css';

export default function ReportsPage() {
  const [reports, setReports] = useState<{ id: string; type: string; title: string; format: string; generatedAt: string }[]>([]);

  useEffect(() => {
    fetch('/api/v1/compliance-ai/reports').then((r) => r.json()).then((d) => setReports(d.reports ?? [])).catch(() => {});
  }, []);

  return (
    <ComplianceShell>
      <p className={styles.hint}>Compliance summary, executive dashboard, risk, vendor, policy, audit evidence, employee, and AI governance reports. Export PDF/Excel/CSV/JSON (stub).</p>
      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr><th>Report</th><th>Type</th><th>Format</th><th>Generated</th></tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td>{r.title}</td>
                <td>{r.type}</td>
                <td>{r.format}</td>
                <td>{new Date(r.generatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ComplianceShell>
  );
}
