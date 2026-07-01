'use client';

import { defaultCustomerSupportAIService, DEMO_TENANT_ID } from '@ai-pass/customer-support-ai';
import { SupportAppShell } from '../SupportAppShell';
import styles from '../support.module.css';

export default function TicketManagementPage() {
  const tickets = defaultCustomerSupportAIService.listTickets(DEMO_TENANT_ID);

  return (
    <SupportAppShell title="Ticket Management" subtitle="Create, assign, prioritize, and track SLA">
      <section className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Subject</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Category</th>
              <th>Assignee</th>
              <th>SLA Due</th>
              <th>CRM</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.subject}</td>
                <td>
                  <span className={`${styles.badge} ${
                    t.priority === 'urgent' ? styles.badgeEscalated : styles.badgeOpen
                  }`}>
                    {t.priority}
                  </span>
                </td>
                <td>{t.status}</td>
                <td>{t.category ?? '—'}</td>
                <td>{t.assigneeName ?? 'Unassigned'}</td>
                <td>
                  {t.slaDueAt ? new Date(t.slaDueAt).toLocaleString() : '—'}
                  {t.slaBreached && ' ⚠'}
                </td>
                <td>{t.crmExternalId ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </SupportAppShell>
  );
}
