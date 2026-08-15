'use client';

import { COMPLIANCE_WORKFLOWS, VENDOR_INTEGRATIONS } from '@ai-pass/compliance-ai';
import { ComplianceShell } from '../components/ComplianceShell';
import styles from '../compliance-ai.module.css';

export default function AdminPage() {
  return (
    <ComplianceShell>
      <p className={styles.hint}>Administration - workflows, integrations, membership gates, and audit configuration.</p>
      <div className={styles.card}>
        <p className={styles.cardTitle}>Compliance Workflows</p>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13 }}>
          {Object.entries(COMPLIANCE_WORKFLOWS).map(([key, id]) => (
            <li key={key}>{key}: <code>{id}</code></li>
          ))}
        </ul>
      </div>
      <div className={styles.card} style={{ marginTop: 16 }}>
        <p className={styles.cardTitle}>Plan Gates</p>
        <table className={styles.table}>
          <thead><tr><th>Feature</th><th>Free</th><th>Starter (Pro)</th><th>Growth (Power)</th><th>Enterprise</th></tr></thead>
          <tbody>
            <tr><td>Compliance AI core</td><td>-</td><td>✓</td><td>✓</td><td>✓</td></tr>
            <tr><td>Trust Center publish</td><td>-</td><td>-</td><td>✓</td><td>✓</td></tr>
            <tr><td>AI Copilot</td><td>-</td><td>-</td><td>✓</td><td>✓</td></tr>
            <tr><td>Audit evidence packages</td><td>-</td><td>-</td><td>-</td><td>✓</td></tr>
          </tbody>
        </table>
      </div>
      <div className={styles.card} style={{ marginTop: 16 }}>
        <p className={styles.cardTitle}>Vendor Integrations</p>
        <table className={styles.table}>
          <thead><tr><th>Provider</th><th>Status</th></tr></thead>
          <tbody>
            {VENDOR_INTEGRATIONS.map((i) => (
              <tr key={i.provider}><td>{i.provider}</td><td>{i.status}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </ComplianceShell>
  );
}
