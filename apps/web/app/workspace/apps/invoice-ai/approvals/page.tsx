'use client';

import { defaultInvoiceAIService, DEMO_TENANT_ID } from '@ai-pass/invoice-ai';
import { InvoiceShell } from '../components/InvoiceShell';
import styles from '../invoice-ai.module.css';

export default function ApprovalsPage() {
  const pending = defaultInvoiceAIService.listApprovals(DEMO_TENANT_ID, 'pending');
  const all = defaultInvoiceAIService.listApprovals(DEMO_TENANT_ID);

  return (
    <InvoiceShell>
      <div className={styles.grid} style={{ marginBottom: 24 }}>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Pending</p>
          <p className={styles.statValue}>{pending.length}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Total queue</p>
          <p className={styles.statValue}>{all.length}</p>
        </div>
      </div>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Approval queue</h2>
        {pending.length === 0 ? (
          <p className={styles.empty}>No pending approvals.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Approver</th>
                <th>Level</th>
                <th>Requested</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((a) => {
                const inv = defaultInvoiceAIService.getInvoice(a.invoiceId);
                return (
                  <tr key={a.id}>
                    <td>{inv?.invoiceNumber ?? a.invoiceId}</td>
                    <td>{a.approverName}</td>
                    <td>{a.level}</td>
                    <td>{new Date(a.requestedAt).toLocaleString()}</td>
                    <td>
                      <button type="button" className={styles.btn} style={{ marginRight: 8 }}>
                        Approve
                      </button>
                      <button type="button" className={`${styles.btn} ${styles.btnSecondary}`}>
                        Reject
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </InvoiceShell>
  );
}
