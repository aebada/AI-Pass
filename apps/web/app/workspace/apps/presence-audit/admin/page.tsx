'use client';

import { getPresenceLimits } from '@ai-pass/presence-audit';
import { PresenceAuditShell } from '../components/PresenceAuditShell';
import styles from '../presence-audit.module.css';

const TIERS = ['free', 'professional', 'power', 'enterprise'] as const;
const TIER_LABELS = { free: 'Free', professional: 'Pro', power: 'Growth', enterprise: 'Enterprise' };

export default function AdministrationPage() {
  return (
    <PresenceAuditShell>
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Membership limits</h2>
        <table style={{ width: '100%', fontSize: 13, marginTop: 12, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--ai-text-muted)' }}>
              <th style={{ padding: 8 }}>Plan</th>
              <th style={{ padding: 8 }}>Audits/mo</th>
              <th style={{ padding: 8 }}>Providers</th>
              <th style={{ padding: 8 }}>Competitors</th>
              <th style={{ padding: 8 }}>Monitoring</th>
              <th style={{ padding: 8 }}>API</th>
            </tr>
          </thead>
          <tbody>
            {TIERS.map((tier) => {
              const limits = getPresenceLimits(tier);
              return (
                <tr key={tier} style={{ borderTop: '1px solid var(--ai-border)' }}>
                  <td style={{ padding: 8 }}>{TIER_LABELS[tier]}</td>
                  <td style={{ padding: 8 }}>{limits.auditsPerMonth === Infinity ? '∞' : limits.auditsPerMonth}</td>
                  <td style={{ padding: 8 }}>{limits.maxProviders}</td>
                  <td style={{ padding: 8 }}>{limits.maxCompetitors === Infinity ? '∞' : limits.maxCompetitors}</td>
                  <td style={{ padding: 8 }}>{limits.monitoringSchedules ? 'Yes' : '—'}</td>
                  <td style={{ padding: 8 }}>{limits.apiAccess ? 'Yes' : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Integrations</h2>
        <div className={styles.list} style={{ marginTop: 12 }}>
          {[
            'AI Provider Hub — all audit queries',
            'AI Wallet — credits per provider request',
            'Membership — tier limits',
            'Trust Engine — trust score in recommendations',
            'Knowledge Pipeline — content for optimization',
            'Analysis Studio — trend charts',
            'LiveSync — event-driven re-audits',
            'Discovery Hub — tool visibility linkage',
          ].map((item) => (
            <div key={item} className={styles.listItem}>{item}</div>
          ))}
        </div>
      </section>
    </PresenceAuditShell>
  );
}
