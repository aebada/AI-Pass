'use client';

import styles from './KpiCards.module.css';
import type { KpiMetric } from './dashboardData';

export function KpiCards({ metrics }: { metrics: KpiMetric[] }) {
  return (
    <div className={styles.grid}>
      {metrics.map((m) => (
        <article key={m.id} className={styles.card}>
          <div className={styles.cardTop}>
            <span className={styles.label}>{m.label}</span>
            <span className={styles.icon} style={{ background: m.iconBg }}>
              {m.icon}
            </span>
          </div>
          <div className={styles.value}>{m.value}</div>
          <div className={`${styles.delta} ${m.deltaPositive ? styles.deltaUp : styles.deltaDown}`}>
            {m.delta}
          </div>
        </article>
      ))}
    </div>
  );
}
