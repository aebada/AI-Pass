'use client';

import { DEMO_COMPANY, defaultPresenceAuditPlatform } from '@ai-pass/presence-audit';
import { PresenceAuditShell } from '../components/PresenceAuditShell';
import styles from '../presence-audit.module.css';

const latest = defaultPresenceAuditPlatform.getAuditHistory(DEMO_COMPANY.id).slice(-1)[0];
const competitors = latest?.competitorSnapshot ?? [];
const comparison = defaultPresenceAuditPlatform.competitors.compare(DEMO_COMPANY, competitors);

export default function CompetitorsPage() {
  return (
    <PresenceAuditShell>
      <div className={styles.grid}>
        {competitors.map((c) => (
          <div key={c.id} className={styles.card}>
            <p className={styles.cardTitle}>{c.name}</p>
            <p className={styles.statValue} style={{ fontSize: 22 }}>{c.visibilityScore}%</p>
            <p style={{ fontSize: 12, color: 'var(--ai-text-muted)', margin: '8px 0 0' }}>
              Share of AI recommendations: {c.shareOfRecommendations}%
            </p>
          </div>
        ))}
      </div>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Side-by-side comparison</h2>
        <div className={styles.list} style={{ marginTop: 12 }}>
          {comparison.sideBySide.map((row) => (
            <div key={row.dimension} className={styles.listItem} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{row.dimension}</span>
              <span>AI-Pass {row.company}% vs {row.competitor}% — winner: {row.winner}</span>
            </div>
          ))}
        </div>
      </section>
    </PresenceAuditShell>
  );
}
