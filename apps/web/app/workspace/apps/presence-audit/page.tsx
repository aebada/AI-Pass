'use client';

import Link from 'next/link';
import {
  DEMO_COMPANY,
  DEMO_OPTIMIZATION_RECS,
  defaultPresenceAuditPlatform,
} from '@ai-pass/presence-audit';
import { PresenceAuditShell, ProviderBadge, SeverityBadge } from './components/PresenceAuditShell';
import styles from './presence-audit.module.css';

export default function PresenceAuditDashboardPage() {
  const dashboard = defaultPresenceAuditPlatform.getDashboard(DEMO_COMPANY.tenantId);
  if (!dashboard) {
    return (
      <PresenceAuditShell>
        <p className={styles.cardTitle}>Loading presence audit dashboard…</p>
      </PresenceAuditShell>
    );
  }
  const { score, competitorRanking, opportunities, criticalIssues, optimizationProgress, trustScore, trustCertified } = dashboard;

  return (
    <PresenceAuditShell>
      <div className={styles.grid}>
        <div className={styles.card}>
          <p className={styles.cardTitle}>AI Presence Score</p>
          <p className={styles.statValue}>{score.overall}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Visibility</p>
          <p className={styles.statValue}>{score.visibility}%</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Recommendation</p>
          <p className={styles.statValue}>{score.recommendation}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Trust Score</p>
          <p className={styles.statValue}>{trustScore ?? '—'}{trustCertified ? ' ✓' : ''}</p>
        </div>
      </div>

      <div className={styles.twoCol}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Visibility trend</h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
            {dashboard.visibilityTrend.map((v, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${v}%`,
                  background: 'var(--ai-accent, #58a6ff)',
                  borderRadius: 4,
                  minHeight: 4,
                }}
                title={`${v}`}
              />
            ))}
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Optimization progress</h2>
          <p className={styles.statValue} style={{ fontSize: 20 }}>{optimizationProgress}%</p>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${optimizationProgress}%` }} />
          </div>
          <p style={{ fontSize: 12, marginTop: 8, color: 'var(--ai-text-muted)' }}>
            {DEMO_OPTIMIZATION_RECS.filter((r) => r.status === 'done').length} of {DEMO_OPTIMIZATION_RECS.length} complete
          </p>
        </section>
      </div>

      <div className={styles.twoCol}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Platforms audited</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {dashboard.platformsAudited.map((p) => (
              <ProviderBadge key={p} provider={p} />
            ))}
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Competitor ranking</h2>
          <div className={styles.list}>
            {competitorRanking.map((c) => (
              <div key={c.name} className={styles.listItem} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>#{c.rank} {c.name}</span>
                <span>{c.score}% visibility</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className={styles.twoCol}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Critical issues</h2>
          {criticalIssues.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--ai-text-muted)' }}>No critical issues</p>
          ) : (
            <div className={styles.list}>
              {criticalIssues.map((issue) => (
                <div key={issue.id} className={styles.listItem}>
                  <SeverityBadge severity={issue.severity} />
                  <span style={{ marginLeft: 8 }}>{issue.description}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Opportunities</h2>
          <div className={styles.list}>
            {opportunities.slice(0, 5).map((o) => (
              <div key={o} className={styles.listItem}>{o}</div>
            ))}
          </div>
        </section>
      </div>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Quick actions</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/workspace/apps/presence-audit/results" className={styles.subNavLinkActive} style={{ padding: '8px 16px' }}>
            View audit results
          </Link>
          <Link href="/workspace/apps/presence-audit/optimize" className={styles.subNavLink} style={{ padding: '8px 16px' }}>
            Optimization center
          </Link>
          <Link href="/workspace/apps/presence-audit/monitoring" className={styles.subNavLink} style={{ padding: '8px 16px' }}>
            Monitoring & alerts
          </Link>
        </div>
      </section>
    </PresenceAuditShell>
  );
}
