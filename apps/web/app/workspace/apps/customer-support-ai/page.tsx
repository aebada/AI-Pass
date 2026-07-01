'use client';

import Link from 'next/link';
import { defaultCustomerSupportAIService, DEMO_TENANT_ID } from '@ai-pass/customer-support-ai';
import { SupportAppShell } from './SupportAppShell';
import styles from './support.module.css';

const TENANT = DEMO_TENANT_ID;

export default function CustomerSupportDashboardPage() {
  const stats = defaultCustomerSupportAIService.getDashboard(TENANT);
  const conversations = defaultCustomerSupportAIService.listConversations(TENANT);
  const tickets = defaultCustomerSupportAIService.listTickets(TENANT);

  return (
    <SupportAppShell
      title="Customer Support AI"
      subtitle="Enterprise multilingual voice + text customer service platform"
    >
      <div className={styles.actions}>
        <Link href="/workspace/apps/customer-support-ai/live-chat" className={styles.actionBtn}>
          Start Live Chat
        </Link>
        <Link href="/workspace/apps/customer-support-ai/voice" className={styles.actionBtn}>
          Open Voice Console
        </Link>
        <Link href="/workspace/apps/customer-support-ai/tickets" className={styles.actionBtn}>
          Manage Tickets
        </Link>
        <Link href="/workspace/apps/customer-support-ai/analytics" className={styles.actionBtn}>
          View Analytics
        </Link>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Active Conversations</h3>
          <p className={styles.statValue}>{stats.activeConversations}</p>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Open Tickets</h3>
          <p className={styles.statValue}>{stats.openTickets}</p>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>AI Resolution Rate</h3>
          <p className={styles.statValue}>{stats.aiResolutionRate}%</p>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Escalation Rate</h3>
          <p className={styles.statValue}>{stats.escalationRate}%</p>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>CSAT</h3>
          <p className={styles.statValue}>{stats.avgCsat}/5</p>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Avg Response</h3>
          <p className={styles.statValue}>{stats.avgResponseTimeMs}ms</p>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Voice / Chat</h3>
          <p className={styles.statValue}>{stats.voiceUsagePercent}% / {stats.chatUsagePercent}%</p>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Confidence</h3>
          <p className={styles.statValue}>{Math.round(stats.avgConfidence * 100)}%</p>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Cost (credits)</h3>
          <p className={styles.statValue}>{stats.totalCostCredits}</p>
        </div>
      </div>

      <section className={styles.card}>
        <h3 className={styles.cardTitle}>Recent Conversations</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Channel</th>
              <th>Language</th>
              <th>Intent</th>
              <th>Status</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {conversations.slice(0, 5).map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.channel}</td>
                <td>{c.language.toUpperCase()}</td>
                <td>{c.intent ?? '—'}</td>
                <td>
                  <span className={`${styles.badge} ${
                    c.status === 'escalated' ? styles.badgeEscalated :
                    c.status === 'resolved' ? styles.badgeResolved :
                    styles.badgeActive
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td>{Math.round(c.confidence * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={styles.card} style={{ marginTop: 16 }}>
        <h3 className={styles.cardTitle}>Open Tickets</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assignee</th>
            </tr>
          </thead>
          <tbody>
            {tickets.filter((t) => t.status !== 'closed').map((t) => (
              <tr key={t.id}>
                <td>{t.subject}</td>
                <td>{t.priority}</td>
                <td><span className={`${styles.badge} ${styles.badgeOpen}`}>{t.status}</span></td>
                <td>{t.assigneeName ?? 'Unassigned'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </SupportAppShell>
  );
}
