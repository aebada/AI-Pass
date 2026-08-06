'use client';

import { useState } from 'react';
import { defaultSalesAIService, DEMO_TENANT_ID } from '@ai-pass/sales-ai';
import { SalesAppShell } from '../SalesAppShell';
import styles from '../sales-ai.module.css';

const TENANT = DEMO_TENANT_ID;
const LI_TYPES = ['connection', 'follow_up', 'inmail', 'comment', 'profile_optimization', 'sequence'] as const;

export default function LinkedInAssistantPage() {
  const leads = defaultSalesAIService.listLeads(TENANT);
  const [type, setType] = useState<string>('connection');
  const [leadId, setLeadId] = useState(leads[0]?.id ?? '');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch('/api/sales/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': TENANT },
        body: JSON.stringify({ type, leadId }),
      });
      const data = await res.json();
      if (data.draft) setContent(data.draft.content);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SalesAppShell title="LinkedIn Assistant" subtitle="Connection requests, InMail, comments, and profile optimization">
      <div className={styles.card}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Message Type</label>
          <select className={styles.select} value={type} onChange={(e) => setType(e.target.value)}>
            {LI_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Lead</label>
          <select className={styles.select} value={leadId} onChange={(e) => setLeadId(e.target.value)}>
            {leads.map((l) => <option key={l.id} value={l.id}>{l.company}</option>)}
          </select>
        </div>
        <button className={styles.sendBtn} onClick={generate} disabled={loading}>
          {loading ? 'Generating…' : 'Generate LinkedIn Message'}
        </button>
      </div>
      {content && (
        <section className={styles.card} style={{ marginTop: 16 }}>
          <h3 className={styles.cardTitle}>Generated Content</h3>
          <div className={styles.draftPreview}>{content}</div>
        </section>
      )}
    </SalesAppShell>
  );
}
