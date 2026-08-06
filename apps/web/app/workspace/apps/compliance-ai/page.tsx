'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ComplianceShell } from './components/ComplianceShell';
import styles from './compliance-ai.module.css';

interface Dashboard {
  complianceScore: number;
  activeFrameworks: number;
  openRisks: number;
  criticalRisks: number;
  evidenceCollected: number;
  evidencePending: number;
  vendorHighRisk: number;
  aiGovernanceStatus: string;
  employeeComplianceRate: number;
  auditReadiness: number;
  trustCenterStatus: string;
  upcomingReviews: { id: string; title: string; dueAt: string; type: string }[];
}

export default function ComplianceDashboardPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);

  useEffect(() => {
    fetch('/api/v1/compliance-ai/dashboard')
      .then((r) => r.json())
      .then((d) => setDashboard(d.dashboard))
      .catch(() => {});
  }, []);

  const d = dashboard;

  return (
    <ComplianceShell showCopilot>
      <p className={styles.hint}>
        Complete compliance operations platform — security, privacy, AI governance, certification, and regulatory automation.
      </p>

      <div className={styles.grid}>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Compliance Score</p>
          <p className={styles.statValue}>{d?.complianceScore ?? '—'}%</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Active Frameworks</p>
          <p className={styles.statValue}>{d?.activeFrameworks ?? '—'}</p>
          <p className={styles.statSub}>ISO 27001, GDPR, ISO 42001</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Open Risks</p>
          <p className={styles.statValue}>{d?.openRisks ?? '—'}</p>
          <p className={styles.statSub}>{d?.criticalRisks ?? 0} critical/high</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Evidence</p>
          <p className={styles.statValue}>{d?.evidenceCollected ?? '—'}</p>
          <p className={styles.statSub}>{d?.evidencePending ?? 0} pending</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Vendor Risk</p>
          <p className={styles.statValue}>{d?.vendorHighRisk ?? '—'}</p>
          <p className={styles.statSub}>high-risk vendors</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>AI Governance</p>
          <p className={styles.statValue} style={{ fontSize: 14 }}>{d?.aiGovernanceStatus ?? '—'}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Employee Compliance</p>
          <p className={styles.statValue}>{d?.employeeComplianceRate ?? '—'}%</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Audit Readiness</p>
          <p className={styles.statValue}>{d?.auditReadiness ?? '—'}%</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Trust Center</p>
          <p className={styles.statValue} style={{ fontSize: 16, textTransform: 'capitalize' }}>
            {d?.trustCenterStatus ?? '—'}
          </p>
        </div>
      </div>

      <div className={styles.actionRow} style={{ marginTop: 24 }}>
        <Link href="/workspace/apps/compliance-ai/frameworks" className={styles.btnPrimary}>Manage Frameworks</Link>
        <Link href="/workspace/apps/compliance-ai/risks" className={styles.btnPrimary}>Review Risks</Link>
        <Link href="/workspace/apps/compliance-ai/evidence" className={styles.btnPrimary}>Collect Evidence</Link>
        <Link href="/workspace/apps/compliance-ai/trust-center" className={styles.btnPrimary}>Trust Center</Link>
      </div>

      {d?.upcomingReviews && d.upcomingReviews.length > 0 && (
        <div className={styles.card} style={{ marginTop: 16 }}>
          <p className={styles.cardTitle}>Upcoming Reviews</p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Type</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              {d.upcomingReviews.map((r) => (
                <tr key={r.id}>
                  <td>{r.title}</td>
                  <td>{r.type}</td>
                  <td>{new Date(r.dueAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ComplianceShell>
  );
}
