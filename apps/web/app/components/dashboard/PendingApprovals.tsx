'use client';

import Link from 'next/link';
import styles from './PendingApprovals.module.css';
import type { PendingApproval } from './dashboardData';

interface Props {
  approvals: PendingApproval[];
  subtitle?: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function PendingApprovals({ approvals, subtitle, onApprove, onReject }: Props) {
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <h2 className={styles.title}>Pending approvals</h2>
            <span className={styles.badge}>{approvals.length} pending</span>
          </div>
          <p className={styles.subtitle}>
            {subtitle ?? (approvals.length === 0 ? 'No pending approvals' : `${approvals.length} awaiting review`)}
          </p>
        </div>
      </div>

      <div className={styles.list}>
        {approvals.length === 0 ? (
          <p className={styles.empty}>All caught up — no pending approvals.</p>
        ) : (
          approvals.map((item) => (
            <article key={item.id} className={styles.item}>
              <div className={styles.itemBody}>
                <h3 className={styles.itemTitle}>{item.title}</h3>
                {item.amount && <span className={styles.amount}>{item.amount}</span>}
                <p className={styles.meta}>
                  <span className={styles.agent}>{item.agent.toUpperCase()}</span>
                  <span className={styles.sep}>·</span>
                  {item.policy}
                  <span className={styles.sep}>·</span>
                  {item.timeAgo}
                </p>
              </div>
              <div className={styles.actions}>
                <button type="button" className={styles.approve} onClick={() => onApprove(item.id)}>
                  Approve
                </button>
                <button type="button" className={styles.reject} onClick={() => onReject(item.id)}>
                  Reject
                </button>
                <Link href="/platform/governance" className={styles.review}>
                  Review
                </Link>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
