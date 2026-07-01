'use client';

import { defaultCrmRegistry } from '@ai-pass/crm-connectors';
import { SupportAppShell } from '../SupportAppShell';
import styles from '../support.module.css';

const CHANNELS = ['web', 'mobile', 'whatsapp', 'teams', 'slack', 'email'];
const CRM_PROVIDERS = defaultCrmRegistry.list();

export default function SettingsPage() {
  return (
    <SupportAppShell title="Settings" subtitle="Channels and CRM connections">
      <section className={styles.card}>
        <h3 className={styles.cardTitle}>Channels</h3>
        <div className={styles.grid}>
          {CHANNELS.map((ch) => (
            <div key={ch} className={styles.card} style={{ padding: 12 }}>
              <strong style={{ textTransform: 'capitalize' }}>{ch}</strong>
              <p className={styles.statMeta}>
                {ch === 'web' ? 'Enabled' : 'Stub — configure integration'}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.card} style={{ marginTop: 16 }}>
        <h3 className={styles.cardTitle}>CRM Connections</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Provider</th>
              <th>Status</th>
              <th>Mode</th>
            </tr>
          </thead>
          <tbody>
            {CRM_PROVIDERS.map((p) => (
              <tr key={p}>
                <td style={{ textTransform: 'capitalize' }}>{p}</td>
                <td><span className={`${styles.badge} ${styles.badgeOpen}`}>Available</span></td>
                <td>Adapter stub</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </SupportAppShell>
  );
}
