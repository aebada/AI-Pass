'use client';

import Link from 'next/link';
import { ContentAIShell } from '../components/ContentAIShell';
import styles from '../content-ai.module.css';

export default function SettingsPage() {
  return (
    <ContentAIShell>
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>App settings</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label style={{ fontSize: 14 }}>
            Default detection model
            <select className={styles.select} style={{ display: 'block', marginTop: 8, width: '100%', maxWidth: 320 }}>
              <option>GPT-4o (recommended)</option>
              <option>Claude 3.5 Sonnet</option>
              <option>Gemini 1.5 Pro</option>
            </select>
          </label>
          <label style={{ fontSize: 14 }}>
            Default humanize tone
            <select className={styles.select} style={{ display: 'block', marginTop: 8, width: '100%', maxWidth: 320 }}>
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="academic">Academic</option>
            </select>
          </label>
          <label style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" defaultChecked />
            Emit LiveSync events on scan complete
          </label>
          <label style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" defaultChecked />
            Run Trust Engine quality review on humanize
          </label>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Integrations</h2>
        <ul style={{ fontSize: 14, lineHeight: 2, paddingLeft: 20 }}>
          <li><Link href="/workspace/providers" style={{ color: 'var(--ai-accent)' }}>Provider Hub</Link> - multi-model routing</li>
          <li><Link href="/workspace/wallet" style={{ color: 'var(--ai-accent)' }}>AI Wallet</Link> - credit billing</li>
          <li><Link href="/workspace/trust" style={{ color: 'var(--ai-accent)' }}>Trust Engine</Link> - output quality scoring</li>
          <li><Link href="/workspace/membership" style={{ color: 'var(--ai-accent)' }}>Membership</Link> - tier gates</li>
        </ul>
      </section>
    </ContentAIShell>
  );
}
