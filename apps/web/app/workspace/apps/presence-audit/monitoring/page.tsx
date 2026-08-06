'use client';

import { DEMO_ALERTS, DEMO_COMPANY, DEMO_MONITORING_EVENTS, defaultPresenceAuditPlatform } from '@ai-pass/presence-audit';
import { PresenceAuditShell, SeverityBadge } from '../components/PresenceAuditShell';
import styles from '../presence-audit.module.css';

const schedule = defaultPresenceAuditPlatform.monitoring.getSchedule(DEMO_COMPANY.id);

export default function MonitoringPage() {
  return (
    <PresenceAuditShell>
      <div className={styles.grid}>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Schedule</p>
          <p className={styles.statValue} style={{ fontSize: 20, textTransform: 'capitalize' }}>{schedule}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Active alerts</p>
          <p className={styles.statValue}>{DEMO_ALERTS.filter((a) => !a.acknowledged).length}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Events (30d)</p>
          <p className={styles.statValue}>{DEMO_MONITORING_EVENTS.length}</p>
        </div>
      </div>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Alerts</h2>
        <div className={styles.list} style={{ marginTop: 12 }}>
          {DEMO_ALERTS.map((alert) => (
            <div key={alert.id} className={styles.listItem}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                <SeverityBadge severity={alert.severity} />
                <strong>{alert.title}</strong>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>via {alert.channel}</span>
              </div>
              <p style={{ fontSize: 13, margin: 0, color: 'var(--text-muted)' }}>{alert.message}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Monitoring events</h2>
        <div className={styles.list} style={{ marginTop: 12 }}>
          {DEMO_MONITORING_EVENTS.map((evt) => (
            <div key={evt.id} className={styles.listItem}>
              <strong>{evt.title}</strong>
              <p style={{ fontSize: 13, margin: '4px 0 0', color: 'var(--text-muted)' }}>{evt.description}</p>
            </div>
          ))}
        </div>
      </section>

      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        Alert channels: email, Slack, Teams, push, webhook (stubs). LiveSync triggers re-audit on website/KB/trust changes.
      </p>
    </PresenceAuditShell>
  );
}
