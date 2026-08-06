'use client';

import Link from 'next/link';
import { defaultInvoiceAIService, DEMO_TENANT_ID } from '@ai-pass/invoice-ai';
import { ProGate } from '@ai-pass/ui';
import { useApp } from '../../../../components/premium/AppProviders';
import { InvoiceShell } from '../components/InvoiceShell';
import styles from '../invoice-ai.module.css';

export default function FraudCenterPage() {
  const { user } = useApp();
  const alerts = defaultInvoiceAIService.listFraudAlerts(DEMO_TENANT_ID);
  const open = alerts.filter((a) => a.status === 'open' || a.status === 'investigating');

  return (
    <InvoiceShell>
      <ProGate
        requiredTier="pro"
        currentTier={user?.plan ?? 'free'}
        featureName="Fraud Center"
      >
        <div className={styles.grid} style={{ marginBottom: 24 }}>
          <div className={styles.card}>
            <p className={styles.cardTitle}>Open alerts</p>
            <p className={styles.statValue}>{open.length}</p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardTitle}>Total alerts</p>
            <p className={styles.statValue}>{alerts.length}</p>
          </div>
        </div>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Fraud alerts</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Severity</th>
                <th>Title</th>
                <th>Type</th>
                <th>Score</th>
                <th>Status</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a.id}>
                  <td>
                    <span
                      className={styles.badge}
                      style={{
                        background:
                          a.severity === 'critical' || a.severity === 'high'
                            ? 'rgba(248,81,73,0.2)'
                            : 'rgba(210,153,34,0.2)',
                        color: a.severity === 'critical' || a.severity === 'high' ? '#f85149' : '#d29922',
                      }}
                    >
                      {a.severity}
                    </span>
                  </td>
                  <td>{a.title}</td>
                  <td>{a.type}</td>
                  <td>{(a.score * 100).toFixed(0)}%</td>
                  <td>{a.status}</td>
                  <td>
                    <Link href={`/workspace/apps/invoice-ai/invoices/${a.invoiceId}`}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </ProGate>
    </InvoiceShell>
  );
}
