'use client';

import { DEMO_AUTOMATION_PACKS } from '@ai-pass/invoice-ai';
import { ProGate } from '@ai-pass/ui';
import { useApp } from '../../../../components/premium/AppProviders';
import { InvoiceShell } from '../components/InvoiceShell';
import styles from '../invoice-ai.module.css';

export default function SettingsPage() {
  const { user } = useApp();

  return (
    <InvoiceShell showChat={false}>
      <section className={styles.card} style={{ marginBottom: 24 }}>
        <h2 className={styles.cardTitle}>Automation settings</h2>
        <div style={{ fontSize: 13, lineHeight: 2 }}>
          <div>
            <label>
              <input type="checkbox" defaultChecked /> Semi-automated mode (default)
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" /> Fully autonomous mode (enterprise)
            </label>
          </div>
          <div>
            <label>
              Auto-approval threshold: <input type="number" defaultValue={1000} style={{ width: 80, marginLeft: 8 }} /> EUR
            </label>
          </div>
          <div>
            <label>
              Fraud score threshold: <input type="number" defaultValue={40} style={{ width: 60, marginLeft: 8 }} />
            </label>
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Industry automation packs</h2>
        <ProGate
          requiredTier="enterprise"
          currentTier={user?.plan ?? 'free'}
          featureName="Enterprise automation packs"
        >
          <div className={styles.packGrid}>
            {DEMO_AUTOMATION_PACKS.map((pack) => (
              <div key={pack.id} className={styles.card}>
                <h3>{pack.name}</h3>
                <p>{pack.description}</p>
                <div className={styles.packMeta}>
                  {pack.industry} · {pack.tier} · {pack.pricingModel}
                </div>
                <div style={{ marginTop: 12 }}>
                  <button type="button" className={styles.btn}>
                    {pack.tier === 'enterprise' ? 'Request install' : 'Install pack'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ProGate>
      </section>
    </InvoiceShell>
  );
}
