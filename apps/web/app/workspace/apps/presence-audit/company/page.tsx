'use client';

import { DEMO_COMPANY } from '@ai-pass/presence-audit';
import { PresenceAuditShell } from '../components/PresenceAuditShell';
import styles from '../presence-audit.module.css';

export default function CompanySetupPage() {
  return (
    <PresenceAuditShell>
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Company profile</h2>
        <div className={styles.twoCol} style={{ marginTop: 16 }}>
          <div>
            <p style={{ fontSize: 13, margin: '8px 0' }}><strong>Name:</strong> {DEMO_COMPANY.name}</p>
            <p style={{ fontSize: 13, margin: '8px 0' }}><strong>Website:</strong> {DEMO_COMPANY.website}</p>
            <p style={{ fontSize: 13, margin: '8px 0' }}><strong>Industry:</strong> {DEMO_COMPANY.industry}</p>
            <p style={{ fontSize: 13, margin: '8px 0' }}><strong>Countries:</strong> {DEMO_COMPANY.countries.join(', ')}</p>
          </div>
          <div>
            <p style={{ fontSize: 13, margin: '8px 0' }}><strong>Products:</strong> {DEMO_COMPANY.products.join(', ')}</p>
            <p style={{ fontSize: 13, margin: '8px 0' }}><strong>Services:</strong> {DEMO_COMPANY.services.join(', ')}</p>
            <p style={{ fontSize: 13, margin: '8px 0' }}><strong>Keywords:</strong> {DEMO_COMPANY.keywords.join(', ')}</p>
          </div>
        </div>
        <p style={{ fontSize: 13, marginTop: 16, color: 'var(--ai-text-muted)' }}>
          <strong>Brand:</strong> {DEMO_COMPANY.brandDescription}
        </p>
        <p style={{ fontSize: 13, marginTop: 8, color: 'var(--ai-text-muted)' }}>
          <strong>Value proposition:</strong> {DEMO_COMPANY.valueProposition}
        </p>
      </section>
      <p style={{ fontSize: 12, color: 'var(--ai-text-muted)' }}>
        POST /api/v1/presence/company to create or update profile. Knowledge Pipeline ingests website, docs, KB, and FAQ for optimization signals.
      </p>
    </PresenceAuditShell>
  );
}
