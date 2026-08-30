'use client';

import { useState } from 'react';
import { defaultSalesAIService, DEMO_TENANT_ID } from '@ai-pass/sales-ai';
import { SalesAppShell } from '../SalesAppShell';
import styles from '../sales-ai.module.css';

const TENANT = DEMO_TENANT_ID;
const EMAIL_TYPES = ['cold', 'follow_up', 'intro', 'investor', 'partnership', 'support', 'proposal', 'quotation'] as const;

export default function EmailAssistantPage() {
  const leads = defaultSalesAIService.listLeads(TENANT);
  const existing = defaultSalesAIService.listEmails(TENANT);
  const [type, setType] = useState<string>('cold');
  const [leadId, setLeadId] = useState(leads[0]?.id ?? '');
  const [draft, setDraft] = useState<{ subject: string; body: string; trustScore?: number } | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch('/api/sales/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': TENANT },
        body: JSON.stringify({ type, leadId }),
      });
      const data = await res.json();
      if (data.draft) setDraft({ subject: data.draft.subject, body: data.draft.body, trustScore: data.draft.trustScore });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SalesAppShell title="Email Assistant" subtitle="Generate personalized cold, follow-up, intro, and proposal emails">
      <div className={styles.card}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Email Type</label>
          <select className={styles.select} value={type} onChange={(e) => setType(e.target.value)}>
            {EMAIL_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Lead</label>
          <select className={styles.select} value={leadId} onChange={(e) => setLeadId(e.target.value)}>
            {leads.map((l) => <option key={l.id} value={l.id}>{l.company}</option>)}
          </select>
        </div>
        <button className={styles.sendBtn} onClick={generate} disabled={loading}>
          {loading ? 'Generating…' : 'Generate Email'}
        </button>
      </div>

      {draft && (
        <section className={styles.card} style={{ marginTop: 16 }}>
          <h3 className={styles.cardTitle}>Generated Draft {draft.trustScore ? `(Trust: ${draft.trustScore})` : ''}</h3>
          <p><strong>Subject:</strong> {draft.subject}</p>
          <div className={styles.draftPreview}>{draft.body}</div>
        </section>
      )}

      <section className={styles.card} style={{ marginTop: 16 }}>
        <h3 className={styles.cardTitle}>Recent Emails</h3>
        <table className={styles.table}>
          <thead><tr><th>Subject</th><th>Type</th><th>Trust</th></tr></thead>
          <tbody>
            {existing.map((e) => (
              <tr key={e.id}><td>{e.subject}</td><td>{e.type}</td><td>{e.trustScore ?? '-'}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </SalesAppShell>
  );
}
