'use client';

import { DEMO_COMPANY, defaultPresenceAuditPlatform } from '@ai-pass/presence-audit';
import { PresenceAuditShell } from '../components/PresenceAuditShell';
import styles from '../presence-audit.module.css';

const reports = defaultPresenceAuditPlatform.getReports(DEMO_COMPANY.id);

export default function ReportsPage() {
  return (
    <PresenceAuditShell>
      <div className={styles.list}>
        {reports.map((report) => (
          <section key={report.id} className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: 16, margin: '0 0 4px' }}>{report.title}</h2>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                  {report.type} · {new Date(report.generatedAt).toLocaleDateString()}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['pdf', 'excel', 'csv', 'json', 'html'] as const).map((fmt) => (
                  <span key={fmt} className={styles.badge} style={{ textTransform: 'uppercase' }}>
                    {fmt}
                  </span>
                ))}
              </div>
            </div>
            <p style={{ fontSize: 13, marginTop: 12, color: 'var(--text-muted)' }}>{report.summary}</p>
            {report.sections.map((s) => (
              <div key={s.id} style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <strong style={{ fontSize: 13 }}>{s.title}</strong>
                <p style={{ fontSize: 13, margin: '4px 0 0', color: 'var(--text-muted)' }}>{s.content}</p>
              </div>
            ))}
          </section>
        ))}
      </div>
    </PresenceAuditShell>
  );
}
