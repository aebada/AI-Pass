'use client';

import Link from 'next/link';
import { defaultInvoiceAIService, DEMO_TENANT_ID } from '@ai-pass/invoice-ai';
import { InvoiceShell, StatusBadge } from '../components/InvoiceShell';
import styles from '../invoice-ai.module.css';

export default function InvoicesListPage() {
  const invoices = defaultInvoiceAIService.listInvoices(DEMO_TENANT_ID);

  return (
    <InvoiceShell>
      <section className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 className={styles.cardTitle} style={{ margin: 0 }}>All invoices</h2>
          <Link href="/workspace/apps/invoice-ai/upload" className={styles.btn}>
            Upload
          </Link>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Number</th>
              <th>Vendor</th>
              <th>Department</th>
              <th>Amount</th>
              <th>Decision</th>
              <th>Status</th>
              <th>Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td>
                  <Link href={`/workspace/apps/invoice-ai/invoices/${inv.id}`}>
                    {inv.invoiceNumber}
                  </Link>
                </td>
                <td>{inv.vendorName}</td>
                <td>{inv.department ?? '—'}</td>
                <td>
                  {inv.currency} {inv.amount.toLocaleString()}
                </td>
                <td>{inv.decision}</td>
                <td>
                  <StatusBadge status={inv.status} />
                </td>
                <td>{new Date(inv.uploadedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </InvoiceShell>
  );
}
