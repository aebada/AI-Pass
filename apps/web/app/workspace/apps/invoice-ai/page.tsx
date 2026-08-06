'use client';

import Link from 'next/link';
import {
  defaultInvoiceAIService,
  DEMO_TENANT_ID,
  DEMO_INVOICES,
} from '@ai-pass/invoice-ai';
import { InvoiceShell, StatusBadge } from './components/InvoiceShell';
import styles from './invoice-ai.module.css';

export default function InvoiceAIDashboardPage() {
  const stats = defaultInvoiceAIService.getDashboard(DEMO_TENANT_ID);
  const recent = DEMO_INVOICES.slice(0, 5);

  return (
    <InvoiceShell>
      <div className={styles.grid}>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Today processed</p>
          <p className={styles.statValue}>{stats.todayProcessed}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Awaiting approval</p>
          <p className={styles.statValue}>{stats.awaitingApproval}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Fraud alerts</p>
          <p className={styles.statValue}>{stats.fraudAlerts}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Monthly spend</p>
          <p className={styles.statValue}>€{stats.monthlySpend.toLocaleString()}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Vendors</p>
          <p className={styles.statValue}>{stats.vendorCount}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Approval rate</p>
          <p className={styles.statValue}>{stats.approvalRate}%</p>
        </div>
      </div>

      <section className={styles.card} style={{ marginTop: 24 }}>
        <h2 className={styles.cardTitle}>Recent invoices</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Number</th>
                <th>Vendor</th>
                <th>Amount</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recent.map((inv) => (
                <tr key={inv.id}>
                  <td>{inv.invoiceNumber}</td>
                  <td>{inv.vendorName}</td>
                  <td>
                    {inv.currency} {inv.amount.toLocaleString()}
                  </td>
                  <td>
                    <StatusBadge status={inv.status} />
                  </td>
                  <td>
                    <Link href={`/workspace/apps/invoice-ai/invoices/${inv.id}`}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </InvoiceShell>
  );
}
