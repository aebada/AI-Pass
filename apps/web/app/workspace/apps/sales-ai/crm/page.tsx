'use client';

import { defaultSalesAIService, DEMO_TENANT_ID } from '@ai-pass/sales-ai';
import { SalesAppShell } from '../SalesAppShell';
import styles from '../sales-ai.module.css';

const TENANT = DEMO_TENANT_ID;

export default function CrmConnectionsPage() {
  const providers = defaultSalesAIService.listCrmProviders();
  const leads = defaultSalesAIService.listLeads(TENANT);

  return (
    <SalesAppShell title="CRM Connections" subtitle="Salesforce, HubSpot, Zoho, Pipedrive, Dynamics, Monday">
      <div className={styles.grid}>
        {providers.map((p) => (
          <div key={p} className={styles.card}>
            <h3 className={styles.cardTitle}>{p.charAt(0).toUpperCase() + p.slice(1)}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Stub adapter — connect via CRM settings</p>
            <span className={`${styles.badge} ${p === 'hubspot' ? styles.badgeActive : styles.badgeDraft}`}>
              {p === 'hubspot' ? 'Connected' : 'Available'}
            </span>
          </div>
        ))}
      </div>

      <section className={styles.card} style={{ marginTop: 16 }}>
        <h3 className={styles.cardTitle}>Sync Leads to CRM</h3>
        <table className={styles.table}>
          <thead><tr><th>Company</th><th>Score</th><th>CRM ID</th><th>Action</th></tr></thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id}>
                <td>{l.company}</td>
                <td>{l.score}</td>
                <td>{l.crmExternalId ?? '—'}</td>
                <td>
                  <button
                    className={styles.actionBtn}
                    onClick={() => fetch('/api/sales/crm/sync', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'x-membership-tier': 'power' },
                      body: JSON.stringify({ provider: 'hubspot', entityType: 'lead', entityId: l.id }),
                    })}
                  >
                    Sync
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </SalesAppShell>
  );
}
