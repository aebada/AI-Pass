'use client';

import Link from 'next/link';
import styles from './WalletCredits.module.css';
import type { LlmSpend } from './dashboardData';

interface Props {
  spent: number;
  budget: number;
  daysLeft: number;
  breakdown: LlmSpend[];
}

export function WalletCredits({ spent, budget, daysLeft, breakdown }: Props) {
  const pct = Math.round((spent / budget) * 100);

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>Wallet &amp; credits</h2>
        <Link href="/workspace/wallet" className={styles.manage}>
          Manage →
        </Link>
      </div>

      <div className={styles.mainStat}>
        <span className={styles.amount}>${spent.toLocaleString()}</span>
        <span className={styles.of}> of ${budget.toLocaleString()}</span>
      </div>
      <p className={styles.label}>Monthly spend</p>

      <div className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ width: `${pct}%` }} />
      </div>
      <div className={styles.progressMeta}>
        <span>{pct}% used</span>
        <span>{daysLeft} days left</span>
      </div>

      <ul className={styles.breakdown}>
        {breakdown.map((item) => (
          <li key={item.provider} className={item.highlight ? styles.highlight : undefined}>
            <span className={styles.provider}>{item.provider}</span>
            <span className={styles.spend}>
              ${item.amount.toLocaleString()} · {item.percent}%
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
