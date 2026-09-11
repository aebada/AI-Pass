'use client';

import { DEMO_VENDORS } from '@ai-pass/invoice-ai';
import { InvoiceShell } from '../components/InvoiceShell';
import styles from '../invoice-ai.module.css';

export default function VendorsPage() {
  return (
    <InvoiceShell>
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Vendor registry</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Country</th>
              <th>Risk score</th>
              <th>Status</th>
              <th>Total spend</th>
              <th>Invoices</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_VENDORS.map((v) => (
              <tr key={v.id}>
                <td>{v.name}</td>
                <td>{v.country ?? '-'}</td>
                <td>
                  <span
                    style={{
                      color: v.riskScore >= 60 ? '#f85149' : v.riskScore >= 40 ? '#d29922' : '#3fb950',
                    }}
                  >
                    {v.riskScore}
                  </span>
                </td>
                <td>{v.status}</td>
                <td>€{v.totalSpend.toLocaleString()}</td>
                <td>{v.invoiceCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </InvoiceShell>
  );
}
