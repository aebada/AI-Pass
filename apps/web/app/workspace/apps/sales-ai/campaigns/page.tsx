'use client';

import { useState } from 'react';
import { defaultSalesAIService, DEMO_TENANT_ID } from '@ai-pass/sales-ai';
import { SalesAppShell } from '../SalesAppShell';
import styles from '../sales-ai.module.css';

const TENANT = DEMO_TENANT_ID;

export default function CampaignsPage() {
  const campaigns = defaultSalesAIService.listCampaigns(TENANT);
  const leads = defaultSalesAIService.listLeads(TENANT);
  const [name, setName] = useState('New Outreach Campaign');
  const [type, setType] = useState('cold');

  return (
    <SalesAppShell title="Campaign Builder" subtitle="Visual sequences — cold, nurturing, follow-up, upsell, renewals">
      <div className={styles.card}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Campaign Name</label>
          <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Type</label>
          <select className={styles.select} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="cold">Cold Outreach</option>
            <option value="nurturing">Nurturing</option>
            <option value="follow_up">Follow-up</option>
            <option value="upsell">Upsell</option>
            <option value="renewal">Renewal</option>
            <option value="investor_outreach">Investor Outreach</option>
          </select>
        </div>
      </div>

      <section className={styles.card} style={{ marginTop: 16 }}>
        <h3 className={styles.cardTitle}>Sequence Preview — {type.replace('_', ' ')}</h3>
        <div className={styles.sequenceSteps}>
          <div className={styles.sequenceStep}>
            <span className={styles.stepNum}>1</span>
            <span>Email — cold intro (Day 0)</span>
          </div>
          <div className={styles.sequenceStep}>
            <span className={styles.stepNum}>2</span>
            <span>LinkedIn — connection request (Day 2)</span>
          </div>
          <div className={styles.sequenceStep}>
            <span className={styles.stepNum}>3</span>
            <span>Email — follow-up (Day 5)</span>
          </div>
          <div className={styles.sequenceStep}>
            <span className={styles.stepNum}>4</span>
            <span>CRM sync + notify (Day 7)</span>
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
          Targets: {leads.map((l) => l.company).join(', ')}
        </p>
      </section>

      <section className={styles.card} style={{ marginTop: 16 }}>
        <h3 className={styles.cardTitle}>Campaigns</h3>
        <table className={styles.table}>
          <thead>
            <tr><th>Name</th><th>Type</th><th>Status</th><th>Sent</th><th>Open</th><th>Reply</th></tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.type}</td>
                <td><span className={`${styles.badge} ${c.status === 'active' ? styles.badgeActive : styles.badgeDraft}`}>{c.status}</span></td>
                <td>{c.sentCount}</td>
                <td>{c.openRate}%</td>
                <td>{c.replyRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </SalesAppShell>
  );
}
