'use client';

import Link from 'next/link';
import styles from './AuditLog.module.css';
import type { AuditEntry, AuditStatus } from './dashboardData';

const STATUS_LABEL: Record<AuditStatus, string> = {
  executed: 'Executed',
  approved: 'Approved',
  rejected: 'Rejected',
  blocked: 'Blocked',
  retried: 'Retried',
};

export function AuditLog({ entries, subtitle }: { entries: AuditEntry[]; subtitle?: string }) {
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Audit log</h2>
          <p className={styles.subtitle}>{subtitle ?? (entries.length === 0 ? 'Activity will appear here as you work' : 'Recent governance events')}</p>
        </div>
        <Link href="/platform/governance" className={styles.manage}>
          Open full log →
        </Link>
      </div>

      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Time</th>
              <th>User / Agent</th>
              <th>Status</th>
              <th>Action detail</th>
              <th className={styles.colResult}>Result</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td className={styles.time}>{entry.timestamp}</td>
                <td className={styles.entity}>{entry.entity}</td>
                <td>
                  <span className={`${styles.badge} ${styles[`badge_${entry.status}`]}`}>
                    {STATUS_LABEL[entry.status]}
                  </span>
                </td>
                <td className={styles.detail}>{entry.detail}</td>
                <td className={styles.colResult}>
                  <span className={entry.ok ? styles.ok : styles.err}>
                    {entry.ok ? 'OK' : 'ERR'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
