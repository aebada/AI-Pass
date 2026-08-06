'use client';

import { defaultCustomerSupportAIService, DEMO_TENANT_ID } from '@ai-pass/customer-support-ai';
import { SupportAppShell } from '../SupportAppShell';
import styles from '../support.module.css';

export default function ConversationHistoryPage() {
  const { conversations, messages } = defaultCustomerSupportAIService.getHistory(DEMO_TENANT_ID);

  return (
    <SupportAppShell title="Conversation History" subtitle="Past conversations across channels and languages">
      <section className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Channel</th>
              <th>Language</th>
              <th>Intent</th>
              <th>Status</th>
              <th>Messages</th>
              <th>Started</th>
            </tr>
          </thead>
          <tbody>
            {conversations.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.channel}</td>
                <td>{c.language.toUpperCase()}</td>
                <td>{c.intent ?? '—'}</td>
                <td>
                  <span className={`${styles.badge} ${
                    c.status === 'escalated' ? styles.badgeEscalated :
                    c.status === 'resolved' ? styles.badgeResolved : styles.badgeActive
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td>{(messages[c.id] ?? []).length}</td>
                <td>{new Date(c.startedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {conversations.map((c) => {
        const msgs = messages[c.id] ?? [];
        if (msgs.length === 0) return null;
        return (
          <section key={c.id} className={styles.card} style={{ marginTop: 16 }}>
            <h3 className={styles.cardTitle}>{c.id} — {c.language.toUpperCase()}</h3>
            {msgs.map((m) => (
              <div key={m.id} style={{ marginBottom: 8, fontSize: 13 }}>
                <strong>{m.role}:</strong> {m.content}
              </div>
            ))}
          </section>
        );
      })}
    </SupportAppShell>
  );
}
