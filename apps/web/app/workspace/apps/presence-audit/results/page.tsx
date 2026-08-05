'use client';

import { DEMO_COMPANY, defaultPresenceAuditPlatform } from '@ai-pass/presence-audit';
import { PresenceAuditShell, ProviderBadge } from '../components/PresenceAuditShell';
import styles from '../presence-audit.module.css';

const results = defaultPresenceAuditPlatform.getResults(DEMO_COMPANY.id);

export default function AuditResultsPage() {
  const byProvider = results.reduce<Record<string, typeof results>>((acc, r) => {
    (acc[r.provider] ??= []).push(r);
    return acc;
  }, {});

  return (
    <PresenceAuditShell>
      {Object.entries(byProvider).map(([provider, responses]) => (
        <section key={provider} className={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <ProviderBadge provider={provider} />
            <span style={{ fontSize: 12, color: 'var(--ai-text-muted)' }}>
              {responses.filter((r) => r.companyMentioned).length}/{responses.length} mentions
            </span>
          </div>
          <div className={styles.list}>
            {responses.map((r) => (
              <div key={r.id} className={styles.listItem}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>
                    {r.companyMentioned ? `Mentioned #${r.rankingPosition ?? '-'}` : 'Not mentioned'}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--ai-text-muted)' }}>{r.creditsUsed ?? 0} credits</span>
                </div>
                <p style={{ fontSize: 13, margin: 0, color: 'var(--ai-text-muted)' }}>{r.fullAnswer}</p>
                {r.competitorsMentioned.length > 0 && (
                  <p style={{ fontSize: 11, marginTop: 6 }}>Competitors: {r.competitorsMentioned.join(', ')}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </PresenceAuditShell>
  );
}
