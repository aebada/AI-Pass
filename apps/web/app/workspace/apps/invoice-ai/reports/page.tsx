'use client';

import { defaultInvoiceAIService, DEMO_TENANT_ID } from '@ai-pass/invoice-ai';
import { InvoiceShell } from '../components/InvoiceShell';
import styles from '../invoice-ai.module.css';

export default function ReportsPage() {
  const stats = defaultInvoiceAIService.getDashboard(DEMO_TENANT_ID);
  const invoices = defaultInvoiceAIService.listInvoices(DEMO_TENANT_ID);

  const byDept = invoices.reduce<Record<string, number>>((acc, i) => {
    const dept = i.department ?? 'Other';
    acc[dept] = (acc[dept] ?? 0) + i.amount;
    return acc;
  }, {});

  const byStatus = invoices.reduce<Record<string, number>>((acc, i) => {
    acc[i.status] = (acc[i.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <InvoiceShell>
      <div className={styles.grid}>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Approval rate</p>
          <p className={styles.statValue}>{stats.approvalRate}%</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Fraud alerts</p>
          <p className={styles.statValue}>{stats.fraudAlerts}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Processed today</p>
          <p className={styles.statValue}>{stats.todayProcessed}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Spend by department</h3>
          {Object.entries(byDept).map(([dept, amount]) => (
            <div key={dept} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13 }}>
              <span>{dept}</span>
              <span>€{amount.toLocaleString()}</span>
            </div>
          ))}
        </section>

        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Invoices by status</h3>
          {Object.entries(byStatus).map(([status, count]) => (
            <div key={status} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13 }}>
              <span>{status.replace(/_/g, ' ')}</span>
              <span>{count}</span>
            </div>
          ))}
        </section>
      </div>
    </InvoiceShell>
  );
}
