'use client';

import { useState } from 'react';
import { defaultSalesAIService, DEMO_TENANT_ID } from '@ai-pass/sales-ai';
import { SalesAppShell } from '../SalesAppShell';
import styles from '../sales-ai.module.css';

const TENANT = DEMO_TENANT_ID;

export default function ProposalsPage() {
  const proposals = defaultSalesAIService.listProposals(TENANT);
  const leads = defaultSalesAIService.listLeads(TENANT);
  const [leadId, setLeadId] = useState(leads[0]?.id ?? '');
  const [generated, setGenerated] = useState<typeof proposals[0] | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch('/api/sales/proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': TENANT },
        body: JSON.stringify({ type: 'proposal', leadId }),
      });
      const data = await res.json();
      if (data.proposal) setGenerated(data.proposal);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SalesAppShell title="Proposals" subtitle="Generate proposals, quotations, RFP responses, and contracts">
      <div className={styles.card}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Lead</label>
          <select className={styles.select} value={leadId} onChange={(e) => setLeadId(e.target.value)}>
            {leads.map((l) => <option key={l.id} value={l.id}>{l.company}</option>)}
          </select>
        </div>
        <button className={styles.sendBtn} onClick={generate} disabled={loading}>
          {loading ? 'Generating…' : 'Generate Proposal'}
        </button>
      </div>

      {generated && (
        <section className={styles.card} style={{ marginTop: 16 }}>
          <h3 className={styles.cardTitle}>{generated.title}</h3>
          <p>{generated.summary}</p>
          {generated.sections.map((s) => (
            <div key={s.heading} style={{ marginTop: 12 }}>
              <strong>{s.heading}</strong>
              <p>{s.content}</p>
            </div>
          ))}
        </section>
      )}

      <section className={styles.card} style={{ marginTop: 16 }}>
        <h3 className={styles.cardTitle}>Saved Proposals</h3>
        <table className={styles.table}>
          <thead><tr><th>Title</th><th>Value</th><th>Trust</th></tr></thead>
          <tbody>
            {proposals.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{p.currency} {p.totalValue?.toLocaleString() ?? '—'}</td>
                <td>{p.trustScore ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </SalesAppShell>
  );
}
