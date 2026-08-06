'use client';

import { useEffect, useState } from 'react';
import { SalesAppShell } from '../SalesAppShell';
import styles from '../sales-ai.module.css';

interface Analytics {
  openRate: number;
  replyRate: number;
  conversionRate: number;
  meetingsBooked: number;
  aiEffectiveness: number;
  roi: number;
  emailsSent: number;
  linkedInSent: number;
  proposalsGenerated: number;
  totalCreditsUsed: number;
  pipelineValue: number;
  trends: Array<{ date: string; emails: number; replies: number; meetings: number }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch('/api/sales/analytics')
      .then((r) => r.json())
      .then(setAnalytics);
  }, []);

  if (!analytics) return <SalesAppShell title="Analytics" subtitle="Loading…"><p>Loading analytics…</p></SalesAppShell>;

  const maxEmails = Math.max(...analytics.trends.map((t) => t.emails), 1);

  return (
    <SalesAppShell title="Analytics" subtitle="Open rate, reply rate, conversion, meetings, AI effectiveness, ROI">
      <div className={styles.grid}>
        <div className={styles.card}><h3 className={styles.cardTitle}>Open Rate</h3><p className={styles.statValue}>{analytics.openRate}%</p></div>
        <div className={styles.card}><h3 className={styles.cardTitle}>Reply Rate</h3><p className={styles.statValue}>{analytics.replyRate}%</p></div>
        <div className={styles.card}><h3 className={styles.cardTitle}>Conversion</h3><p className={styles.statValue}>{analytics.conversionRate}%</p></div>
        <div className={styles.card}><h3 className={styles.cardTitle}>Meetings</h3><p className={styles.statValue}>{analytics.meetingsBooked}</p></div>
        <div className={styles.card}><h3 className={styles.cardTitle}>AI Effectiveness</h3><p className={styles.statValue}>{analytics.aiEffectiveness}%</p></div>
        <div className={styles.card}><h3 className={styles.cardTitle}>ROI</h3><p className={styles.statValue}>{analytics.roi}x</p></div>
        <div className={styles.card}><h3 className={styles.cardTitle}>Emails Sent</h3><p className={styles.statValue}>{analytics.emailsSent}</p></div>
        <div className={styles.card}><h3 className={styles.cardTitle}>Credits Used</h3><p className={styles.statValue}>{analytics.totalCreditsUsed}</p></div>
      </div>

      <section className={styles.card} style={{ marginTop: 16 }}>
        <h3 className={styles.cardTitle}>7-Day Trend</h3>
        <div className={styles.chartBars}>
          {analytics.trends.map((t) => (
            <div key={t.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className={styles.chartBar} style={{ height: `${(t.emails / maxEmails) * 100}%` }} />
              <div className={styles.chartLabel}>{t.date.slice(5)}</div>
            </div>
          ))}
        </div>
      </section>
    </SalesAppShell>
  );
}
