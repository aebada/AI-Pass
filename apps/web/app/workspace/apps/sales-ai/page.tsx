'use client';

import Link from 'next/link';
import { defaultSalesAIService, DEMO_TENANT_ID } from '@ai-pass/sales-ai';
import { SalesAppShell } from './SalesAppShell';
import styles from './sales-ai.module.css';

const TENANT = DEMO_TENANT_ID;

export default function SalesDashboardPage() {
  const stats = defaultSalesAIService.getDashboard(TENANT);
  const leads = defaultSalesAIService.listLeads(TENANT);
  const campaigns = defaultSalesAIService.listCampaigns(TENANT);
  const deals = defaultSalesAIService.listDeals(TENANT);

  return (
    <SalesAppShell
      title="Sales AI"
      subtitle="Close More Deals with AI — personalized outreach, proposals, and pipeline intelligence"
    >
      <div className={styles.actions}>
        <Link href="/workspace/apps/sales-ai/email" className={styles.actionBtn}>Generate Email</Link>
        <Link href="/workspace/apps/sales-ai/copilot" className={styles.actionBtn}>Ask Copilot</Link>
        <Link href="/workspace/apps/sales-ai/campaigns" className={styles.actionBtn}>Build Campaign</Link>
        <Link href="/workspace/playground" className={styles.actionBtn}>Model Playground</Link>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Pipeline Value</h3>
          <p className={styles.statValue}>€{stats.pipelineValue.toLocaleString()}</p>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Active Campaigns</h3>
          <p className={styles.statValue}>{stats.activeCampaigns}</p>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Open Deals</h3>
          <p className={styles.statValue}>{stats.openDeals}</p>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Emails Sent</h3>
          <p className={styles.statValue}>{stats.emailsSent}</p>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Reply Rate</h3>
          <p className={styles.statValue}>{stats.replyRate}%</p>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Meetings Booked</h3>
          <p className={styles.statValue}>{stats.meetingsBooked}</p>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Conversion</h3>
          <p className={styles.statValue}>{stats.conversionRate}%</p>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Credits Used</h3>
          <p className={styles.statValue}>{stats.totalCreditsUsed}</p>
        </div>
      </div>

      <section className={styles.card}>
        <h3 className={styles.cardTitle}>Pipeline — Leads</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Company</th>
              <th>Industry</th>
              <th>Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id}>
                <td>{l.company}</td>
                <td>{l.industry ?? '—'}</td>
                <td>{l.score}</td>
                <td>
                  <span className={`${styles.badge} ${
                    l.status === 'qualified' ? styles.badgeQualified :
                    l.status === 'new' ? styles.badgeDraft : styles.badgeActive
                  }`}>{l.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={styles.card} style={{ marginTop: 16 }}>
        <h3 className={styles.cardTitle}>Active Campaigns</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Sent</th>
              <th>Open Rate</th>
              <th>Reply Rate</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.type}</td>
                <td>{c.sentCount}</td>
                <td>{c.openRate}%</td>
                <td>{c.replyRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={styles.card} style={{ marginTop: 16 }}>
        <h3 className={styles.cardTitle}>Open Deals</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Deal</th>
              <th>Value</th>
              <th>Stage</th>
              <th>Probability</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>{d.currency} {d.value.toLocaleString()}</td>
                <td>{d.stage}</td>
                <td>{d.probability}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </SalesAppShell>
  );
}
