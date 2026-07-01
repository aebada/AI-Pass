'use client';

import { use } from 'react';
import Link from 'next/link';
import { defaultInvoiceAIService } from '@ai-pass/invoice-ai';
import { InvoiceShell, StatusBadge } from '../../components/InvoiceShell';
import styles from '../../invoice-ai.module.css';

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const detail = defaultInvoiceAIService.getInvoiceDetail(id);

  if (!detail) {
    return (
      <InvoiceShell>
        <p className={styles.empty}>Invoice not found.</p>
        <Link href="/workspace/apps/invoice-ai/invoices">Back to list</Link>
      </InvoiceShell>
    );
  }

  const { invoice, validation, approvals, fraudAlerts, auditLogs } = detail;

  return (
    <InvoiceShell>
      <div style={{ marginBottom: 16 }}>
        <Link href="/workspace/apps/invoice-ai/invoices">← Invoices</Link>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Invoice</p>
          <p className={styles.statValue} style={{ fontSize: 20 }}>{invoice.invoiceNumber}</p>
          <StatusBadge status={invoice.status} />
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Vendor</p>
          <p className={styles.statValue} style={{ fontSize: 18 }}>{invoice.vendorName}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Amount</p>
          <p className={styles.statValue} style={{ fontSize: 18 }}>
            {invoice.currency} {invoice.amount.toLocaleString()}
          </p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Decision</p>
          <p className={styles.statValue} style={{ fontSize: 18 }}>{invoice.decision}</p>
        </div>
      </div>

      {validation && (
        <section className={styles.card} style={{ marginBottom: 16 }}>
          <h3 className={styles.cardTitle}>Validation</h3>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13 }}>
            {validation.checks.map((c, i) => (
              <li key={i} style={{ color: c.passed ? 'inherit' : '#f85149' }}>
                {c.rule}: {c.message}
              </li>
            ))}
          </ul>
        </section>
      )}

      {fraudAlerts.length > 0 && (
        <section className={styles.card} style={{ marginBottom: 16 }}>
          <h3 className={styles.cardTitle}>Fraud alerts</h3>
          {fraudAlerts.map((f) => (
            <div key={f.id} style={{ marginBottom: 8, fontSize: 13 }}>
              <strong>{f.title}</strong> — {f.description}
            </div>
          ))}
        </section>
      )}

      {approvals.length > 0 && (
        <section className={styles.card} style={{ marginBottom: 16 }}>
          <h3 className={styles.cardTitle}>Approvals</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Approver</th>
                <th>Status</th>
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              {approvals.map((a) => (
                <tr key={a.id}>
                  <td>{a.approverName}</td>
                  <td>{a.status}</td>
                  <td>{a.comment ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className={styles.card}>
        <h3 className={styles.cardTitle}>Line items</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                <td>{item.unitPrice.toLocaleString()}</td>
                <td>{item.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {auditLogs.length > 0 && (
        <section className={styles.card} style={{ marginTop: 16 }}>
          <h3 className={styles.cardTitle}>Audit trail</h3>
          {auditLogs.map((a) => (
            <div key={a.id} style={{ fontSize: 12, marginBottom: 4 }}>
              {new Date(a.timestamp).toLocaleString()} — {a.action} by {a.actorName}
            </div>
          ))}
        </section>
      )}
    </InvoiceShell>
  );
}
