'use client';

import { DEMO_COMPANY, defaultPresenceAuditPlatform } from '@ai-pass/presence-audit';
import { PresenceAuditShell, ProviderBadge } from '../components/PresenceAuditShell';
import styles from '../presence-audit.module.css';

const history = defaultPresenceAuditPlatform.getAuditHistory(DEMO_COMPANY.id);

export default function HistoryPage() {
  return (
    <PresenceAuditShell>
      <div className={styles.list}>
        {history.map((audit) => (
          <section key={audit.id} className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 16, margin: 0 }}>Audit {audit.id}</h2>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  {audit.completedAt ? new Date(audit.completedAt).toLocaleString() : 'In progress'}
                </p>
              </div>
              <p className={styles.statValue} style={{ fontSize: 24 }}>{audit.score.overall}</p>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {audit.providers.map((p) => (
                <ProviderBadge key={p} provider={p} />
              ))}
            </div>
            <div className={styles.grid} style={{ marginTop: 12 }}>
              <div>
                <p className={styles.cardTitle}>Visibility</p>
                <p style={{ fontSize: 18, fontWeight: 600 }}>{audit.score.visibility}</p>
              </div>
              <div>
                <p className={styles.cardTitle}>Gaps</p>
                <p style={{ fontSize: 18, fontWeight: 600 }}>{audit.gaps.length}</p>
              </div>
              <div>
                <p className={styles.cardTitle}>Responses</p>
                <p style={{ fontSize: 18, fontWeight: 600 }}>{audit.responses.length}</p>
              </div>
            </div>
          </section>
        ))}
      </div>
    </PresenceAuditShell>
  );
}
