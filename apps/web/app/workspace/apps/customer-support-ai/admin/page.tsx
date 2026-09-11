'use client';

import { CUSTOMER_SUPPORT_SKILLS, SUPPORT_SKILL_NAMES } from '@ai-pass/customer-support-ai';
import { SupportAppShell } from '../SupportAppShell';
import styles from '../support.module.css';

export default function AdministrationPage() {
  return (
    <SupportAppShell title="Administration" subtitle="Skills, agents, compliance, and platform integrations">
      <section className={styles.card}>
        <h3 className={styles.cardTitle}>Registered Marketplace Skills ({CUSTOMER_SUPPORT_SKILLS.length})</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Skill</th>
              <th>Category</th>
              <th>Tier</th>
              <th>Credits</th>
            </tr>
          </thead>
          <tbody>
            {CUSTOMER_SUPPORT_SKILLS.map((s) => (
              <tr key={s.name}>
                <td>{s.name}</td>
                <td>{s.category}</td>
                <td>{s.planTierRequired}</td>
                <td>{s.creditCost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={styles.card} style={{ marginTop: 16 }}>
        <h3 className={styles.cardTitle}>Platform Integrations</h3>
        <ul style={{ fontSize: 14, lineHeight: 2 }}>
          <li>AI Provider Hub - routing (cost/latency/quality/membership/risk)</li>
          <li>AI Wallet - per-message, voice, knowledge, workflow, CRM credits</li>
          <li>LiveSync - conversation, ticket, analytics events</li>
          <li>Trust Engine - conversation quality & policy compliance scoring</li>
          <li>Compliance AI - GDPR, PII scan, consent, retention stubs</li>
          <li>Knowledge Pipeline - FAQ/policy retrieval with citations</li>
          <li>Workflow Engine - refund flow stub</li>
          <li>Marketplace - app <code>customer-support-ai</code> + {SUPPORT_SKILL_NAMES.length} skills</li>
        </ul>
      </section>
    </SupportAppShell>
  );
}
