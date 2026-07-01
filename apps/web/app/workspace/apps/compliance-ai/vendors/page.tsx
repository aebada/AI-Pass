'use client';

import { useEffect, useState } from 'react';
import { ComplianceShell, SeverityBadge } from '../components/ComplianceShell';
import styles from '../compliance-ai.module.css';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<{ id: string; name: string; category: string; riskClass: string; questionnaireStatus: string; status: string; integrationProvider?: string }[]>([]);
  const [integrations, setIntegrations] = useState<{ provider: string; status: string; description: string }[]>([]);

  useEffect(() => {
    fetch('/api/v1/compliance-ai/vendors')
      .then((r) => r.json())
      .then((d) => {
        setVendors(d.vendors ?? []);
        setIntegrations(d.integrations ?? []);
      })
      .catch(() => {});
  }, []);

  return (
    <ComplianceShell>
      <div className={styles.card}>
        <p className={styles.cardTitle}>Vendor Inventory</p>
        <table className={styles.table}>
          <thead>
            <tr><th>Vendor</th><th>Category</th><th>Risk</th><th>Questionnaire</th><th>Integration</th><th>Status</th></tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v.id}>
                <td>{v.name}</td>
                <td>{v.category}</td>
                <td><SeverityBadge severity={v.riskClass} /></td>
                <td>{v.questionnaireStatus.replace(/_/g, ' ')}</td>
                <td>{v.integrationProvider ?? '—'}</td>
                <td>{v.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.card} style={{ marginTop: 16 }}>
        <p className={styles.cardTitle}>Integration Stubs</p>
        <table className={styles.table}>
          <thead><tr><th>Provider</th><th>Status</th><th>Description</th></tr></thead>
          <tbody>
            {integrations.map((i) => (
              <tr key={i.provider}>
                <td>{i.provider}</td>
                <td>{i.status}</td>
                <td>{i.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ComplianceShell>
  );
}
