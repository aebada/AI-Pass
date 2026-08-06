'use client';

import Link from 'next/link';
import {
  DEMO_TENANT_ID,
  defaultContentAIPlatform,
} from '@ai-pass/content-ai';
import { ContentAIShell, ScoreBadge } from './components/ContentAIShell';
import styles from './content-ai.module.css';

const dashboard = defaultContentAIPlatform.getDashboard(DEMO_TENANT_ID, 'professional');

export default function ContentAIDashboardPage() {
  const { usage, recentDetections, recentHumanizations, avgAiScore, totalScans, totalHumanized } = dashboard;

  return (
    <ContentAIShell>
      <div className={styles.grid}>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Total scans</p>
          <p className={styles.statValue}>{totalScans}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Humanized</p>
          <p className={styles.statValue}>{totalHumanized}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Avg AI score</p>
          <p className={styles.statValue}>{avgAiScore}%</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Credits used</p>
          <p className={styles.statValue}>{usage.creditsUsed}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Detects this month</p>
          <p className={styles.statValue}>
            {usage.detectsUsed}
            {usage.detectsLimit !== Infinity ? ` / ${usage.detectsLimit}` : ''}
          </p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Humanizes this month</p>
          <p className={styles.statValue}>
            {usage.humanizesUsed}
            {usage.humanizesLimit !== Infinity ? ` / ${usage.humanizesLimit}` : ''}
          </p>
        </div>
      </div>

      <div className={styles.twoCol}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Recent detections</h2>
          {recentDetections.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--ai-text-muted)' }}>No scans yet</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>AI %</th>
                  <th>Trust</th>
                </tr>
              </thead>
              <tbody>
                {recentDetections.map((d) => (
                  <tr key={d.id}>
                    <td>{d.text.slice(0, 60)}…</td>
                    <td>
                      <ScoreBadge label={d.aiScore >= 70 ? 'ai' : d.aiScore <= 30 ? 'human' : 'mixed'} score={d.aiScore} />
                    </td>
                    <td>{d.trustScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Recent humanizations</h2>
          {recentHumanizations.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--ai-text-muted)' }}>No rewrites yet</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Tone</th>
                  <th>Trust</th>
                </tr>
              </thead>
              <tbody>
                {recentHumanizations.map((h) => (
                  <tr key={h.id}>
                    <td>{h.originalText.slice(0, 60)}…</td>
                    <td>{h.tone}</td>
                    <td>{h.trustScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Quick actions</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/workspace/apps/content-ai/detect" className={styles.subNavLinkActive} style={{ padding: '8px 16px' }}>
            Run AI detection
          </Link>
          <Link href="/workspace/apps/content-ai/humanize" className={styles.subNavLink} style={{ padding: '8px 16px' }}>
            Humanize text
          </Link>
          <Link href="/workspace/apps/content-ai/history" className={styles.subNavLink} style={{ padding: '8px 16px' }}>
            View history
          </Link>
        </div>
      </section>
    </ContentAIShell>
  );
}
