'use client';

import styles from './KpiCards.module.css';
import type { KpiMetric } from './dashboardData';
import { ModuleIcon } from '@ai-pass/ui';

export function KpiCards({ metrics }: { metrics: KpiMetric[] }) {
  return (
    <div className={styles.grid}>
      {metrics.map((m) => (
        <article key={m.id} className={styles.card}>
          <div className={styles.cardTop}>
            <span className={styles.label}>{m.label}</span>
            <span className={styles.icon} style={{ background: m.iconBg }}>
              <ModuleIcon name={m.icon} size={16} />
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
