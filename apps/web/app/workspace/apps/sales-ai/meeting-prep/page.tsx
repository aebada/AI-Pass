'use client';

import { useState } from 'react';
import { defaultSalesAIService, DEMO_TENANT_ID } from '@ai-pass/sales-ai';
import { SalesAppShell } from '../SalesAppShell';
import styles from '../sales-ai.module.css';

const TENANT = DEMO_TENANT_ID;

export default function MeetingPrepPage() {
  const preps = defaultSalesAIService.listMeetingPreps(TENANT);
  const [company, setCompany] = useState('TechFlow GmbH');
  const [prep, setPrep] = useState(preps[0] ?? null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch('/api/sales/meeting-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': TENANT },
        body: JSON.stringify({ company, leadId: 'lead_001' }),
      });
      const data = await res.json();
      if (data.prep) setPrep(data.prep);
    } finally {
      setLoading(false);
    }
  }

  const display = prep;

  return (
    <SalesAppShell title="Meeting Prep" subtitle="Company summary, decision makers, news, questions, and strategy">
      <div className={styles.card}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Company</label>
          <input className={styles.input} value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
        <button className={styles.sendBtn} onClick={generate} disabled={loading}>
          {loading ? 'Preparing…' : 'Generate Meeting Prep'}
        </button>
      </div>

      {display && (
        <>
          <section className={styles.card} style={{ marginTop: 16 }}>
            <h3 className={styles.cardTitle}>Company Summary</h3>
            <p>{display.companySummary}</p>
          </section>
          <div className={styles.grid}>
            <section className={styles.card}>
              <h3 className={styles.cardTitle}>Decision Makers</h3>
              <ul>{display.decisionMakers.map((d) => <li key={d.name}>{d.name} - {d.title}</li>)}</ul>
            </section>
            <section className={styles.card}>
              <h3 className={styles.cardTitle}>Recent News</h3>
              <ul>{display.recentNews.map((n) => <li key={n}>{n}</li>)}</ul>
            </section>
          </div>
          <section className={styles.card} style={{ marginTop: 16 }}>
            <h3 className={styles.cardTitle}>Suggested Questions</h3>
            <ol>{display.suggestedQuestions.map((q) => <li key={q}>{q}</li>)}</ol>
          </section>
          <section className={styles.card} style={{ marginTop: 16 }}>
            <h3 className={styles.cardTitle}>Strategy</h3>
            <p>{display.strategy}</p>
          </section>
          <div className={styles.grid}>
            <section className={styles.card}>
              <h3 className={styles.cardTitle}>Risks</h3>
              <ul>{display.risks.map((r) => <li key={r}>{r}</li>)}</ul>
            </section>
            <section className={styles.card}>
              <h3 className={styles.cardTitle}>Opportunities</h3>
              <ul>{display.opportunities.map((o) => <li key={o}>{o}</li>)}</ul>
            </section>
          </div>
        </>
      )}
    </SalesAppShell>
  );
}
