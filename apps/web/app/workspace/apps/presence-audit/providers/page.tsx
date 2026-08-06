'use client';

import { DEMO_COMPANY, PROVIDER_LABELS, defaultPresenceAuditPlatform } from '@ai-pass/presence-audit';
import { PresenceAuditShell, ProviderBadge } from '../components/PresenceAuditShell';
import styles from '../presence-audit.module.css';

const results = defaultPresenceAuditPlatform.getResults(DEMO_COMPANY.id);

const stats = (['openai', 'anthropic', 'google', 'perplexity'] as const).map((provider) => {
  const responses = results.filter((r) => r.provider === provider);
  const mentions = responses.filter((r) => r.companyMentioned).length;
  const avgRank = responses
    .filter((r) => r.rankingPosition)
    .reduce((s, r, _, arr) => s + (r.rankingPosition ?? 0) / arr.length, 0);
  return {
    provider,
    label: PROVIDER_LABELS[provider],
    mentions,
    total: responses.length,
    avgRank: avgRank || null,
    rate: responses.length ? Math.round((mentions / responses.length) * 100) : 0,
  };
});

export default function ProviderComparisonPage() {
  return (
    <PresenceAuditShell>
      <div className={styles.grid}>
        {stats.map((s) => (
          <div key={s.provider} className={styles.card}>
            <ProviderBadge provider={s.provider} />
            <p className={styles.statValue} style={{ fontSize: 22, marginTop: 12 }}>{s.rate}%</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {s.mentions}/{s.total} mentions · avg rank {s.avgRank?.toFixed(1) ?? '—'}
            </p>
          </div>
        ))}
      </div>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Provider insights</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          All queries routed via AI Provider Hub — no direct API calls. Wallet tracks credits per provider request.
        </p>
        <div className={styles.list} style={{ marginTop: 12 }}>
          {stats.map((s) => (
            <div key={s.provider} className={styles.listItem}>
              <strong>{s.label}</strong>: {s.rate >= 50 ? 'Strong presence' : s.rate > 0 ? 'Partial presence' : 'Missing — optimization priority'}
            </div>
          ))}
        </div>
      </section>
    </PresenceAuditShell>
  );
}
