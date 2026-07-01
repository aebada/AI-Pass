'use client';

import Link from 'next/link';
import { CONTENT_AI_PRICING } from '@ai-pass/content-ai';
import { ContentAIShell } from '../components/ContentAIShell';
import styles from '../content-ai.module.css';

const TIERS = [
  { name: 'Free', detects: 3, humanizes: 0, batch: false, api: false, price: '$0' },
  { name: 'Professional', detects: 50, humanizes: 20, batch: false, api: false, price: '$49/mo membership' },
  { name: 'Power', detects: 'Unlimited', humanizes: 200, batch: true, api: false, price: '$149/mo membership' },
  { name: 'Enterprise', detects: 'Unlimited', humanizes: 'Unlimited', batch: true, api: true, price: 'Custom' },
];

export default function PricingPage() {
  return (
    <ContentAIShell>
      <section className={styles.card}>
        <h2 style={{ margin: '0 0 8px', fontSize: 20 }}>Detect AI. Humanize with Confidence.</h2>
        <p style={{ fontSize: 14, color: 'var(--ai-text-muted)', margin: '0 0 24px' }}>
          Professional AI content detection and humanization — integrated with AI-Pass Trust Engine and multi-model Provider Hub.
        </p>
        <div className={styles.grid}>
          <div className={styles.card}>
            <p className={styles.cardTitle}>Pay-per-use</p>
            <p className={styles.statValue}>{CONTENT_AI_PRICING.detectCredits} cr</p>
            <p style={{ fontSize: 13 }}>per detection</p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardTitle}>Humanize</p>
            <p className={styles.statValue}>{CONTENT_AI_PRICING.humanizeCredits} cr</p>
            <p style={{ fontSize: 13 }}>per rewrite</p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardTitle}>App subscription</p>
            <p className={styles.statValue}>${CONTENT_AI_PRICING.subscriptionMonthly}</p>
            <p style={{ fontSize: 13 }}>/mo bundle</p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardTitle}>Revenue share</p>
            <p className={styles.statValue}>{CONTENT_AI_PRICING.revenueShareDeveloper * 100}/{CONTENT_AI_PRICING.revenueSharePlatform * 100}</p>
            <p style={{ fontSize: 13 }}>developer / platform</p>
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Membership tiers</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tier</th>
              <th>Detects/mo</th>
              <th>Humanizes/mo</th>
              <th>Batch</th>
              <th>API</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {TIERS.map((t) => (
              <tr key={t.name}>
                <td>{t.name}</td>
                <td>{t.detects}</td>
                <td>{t.humanizes}</td>
                <td>{t.batch ? '✓' : '—'}</td>
                <td>{t.api ? '✓' : '—'}</td>
                <td>{t.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ fontSize: 13, marginTop: 16 }}>
          <Link href="/workspace/membership" style={{ color: 'var(--ai-accent)' }}>
            Upgrade membership →
          </Link>
          {' · '}
          <Link href="/workspace/wallet" style={{ color: 'var(--ai-accent)' }}>
            Top up wallet credits →
          </Link>
        </p>
      </section>
    </ContentAIShell>
  );
}
