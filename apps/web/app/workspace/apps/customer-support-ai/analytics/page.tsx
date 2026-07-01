'use client';

import { defaultCustomerSupportAIService, DEMO_TENANT_ID } from '@ai-pass/customer-support-ai';
import { SupportAppShell } from '../SupportAppShell';
import styles from '../support.module.css';

export default function AnalyticsPage() {
  const analytics = defaultCustomerSupportAIService.getAnalytics(DEMO_TENANT_ID);
  const maxConv = Math.max(...analytics.trends.map((t) => t.conversations), 1);

  return (
    <SupportAppShell title="Analytics" subtitle="Trends, CSAT, resolution, and cost insights">
      <div className={styles.grid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>AI Resolution</h3>
          <p className={styles.statValue}>{analytics.aiResolutionRate}%</p>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Escalation</h3>
          <p className={styles.statValue}>{analytics.escalationRate}%</p>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>CSAT</h3>
          <p className={styles.statValue}>{analytics.avgCsat}/5</p>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Total Credits</h3>
          <p className={styles.statValue}>{analytics.totalCostCredits}</p>
        </div>
      </div>

      <section className={styles.card}>
        <h3 className={styles.cardTitle}>7-Day Trends</h3>
        <div className={styles.chartBars}>
          {analytics.trends.map((t) => (
            <div key={t.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                className={styles.chartBar}
                style={{ height: `${(t.conversations / maxConv) * 140}px` }}
                title={`${t.conversations} conversations`}
              />
              <span className={styles.chartLabel}>{t.date.slice(5)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.card} style={{ marginTop: 16 }}>
        <h3 className={styles.cardTitle}>Top Issues</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Intent</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {analytics.topIssues.map((issue) => (
              <tr key={issue.intent}>
                <td>{issue.intent}</td>
                <td>{issue.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </SupportAppShell>
  );
}
