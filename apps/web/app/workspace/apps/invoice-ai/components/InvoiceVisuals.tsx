'use client';

import type { Invoice } from '@ai-pass/shared/invoice-ai';
import styles from '../invoice-ai.module.css';

const STATUS_COLORS: Record<string, string> = {
  pending_approval: '#d29922',
  approved: '#3fb950',
  paid: '#3fb950',
  rejected: '#f85149',
  flagged: '#f85149',
  validated: '#58a6ff',
  processing: '#8b949e',
  draft: '#8b949e',
};

const STATUS_LABELS: Record<string, string> = {
  pending_approval: 'Awaiting approval',
  approved: 'Approved',
  paid: 'Paid',
  rejected: 'Rejected',
  flagged: 'Flagged',
  validated: 'Validated',
  processing: 'Processing',
  draft: 'Draft',
};

export function InvoiceVisuals({ invoices }: { invoices: Invoice[] }) {
  const byStatus = invoices.reduce<Record<string, number>>((acc, inv) => {
    acc[inv.status] = (acc[inv.status] ?? 0) + 1;
    return acc;
  }, {});

  const byDept = invoices.reduce<Record<string, number>>((acc, inv) => {
    const dept = inv.department ?? 'Other';
    acc[dept] = (acc[dept] ?? 0) + inv.amount;
    return acc;
  }, {});

  const maxStatus = Math.max(...Object.values(byStatus), 1);
  const maxSpend = Math.max(...Object.values(byDept), 1);
  const total = invoices.reduce((s, i) => s + i.amount, 0);

  return (
    <div className={styles.visualGrid}>
      <section className={styles.card}>
        <h3 className={styles.cardTitle}>Invoices by status</h3>
        <div className={styles.barChart}>
          {Object.entries(byStatus).map(([status, count]) => (
            <div key={status} className={styles.barRow}>
              <span className={styles.barLabel}>{STATUS_LABELS[status] ?? status}</span>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{
                    width: `${(count / maxStatus) * 100}%`,
                    background: STATUS_COLORS[status] ?? '#8b949e',
                  }}
                />
              </div>
              <span className={styles.barValue}>{count}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.card}>
        <h3 className={styles.cardTitle}>Spend by department</h3>
        <div className={styles.barChart}>
          {Object.entries(byDept)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([dept, amount]) => (
              <div key={dept} className={styles.barRow}>
                <span className={styles.barLabel}>{dept}</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{
                      width: `${(amount / maxSpend) * 100}%`,
                      background: 'var(--ai-accent)',
                    }}
                  />
                </div>
                <span className={styles.barValue}>€{amount.toLocaleString()}</span>
              </div>
            ))}
        </div>
        <p className={styles.visualTotal}>Total portfolio value: €{total.toLocaleString()}</p>
      </section>
    </div>
  );
}
