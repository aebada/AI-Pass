'use client';

import { useEffect, useState } from 'react';
import { InvoiceShell } from '../components/InvoiceShell';
import styles from '../invoice-ai.module.css';

const STORAGE_KEY = 'invoice-ai:integrations';

interface IntegrationConfig {
  id: string;
  name: string;
  category: 'erp' | 'collab' | 'webhook';
  description: string;
  fields: { key: string; label: string; type: 'text' | 'password' | 'url'; placeholder?: string }[];
}

const INTEGRATIONS: IntegrationConfig[] = [
  {
    id: 'sap',
    name: 'SAP',
    category: 'erp',
    description: 'Sync approved invoices to SAP S/4HANA or Business One.',
    fields: [
      { key: 'host', label: 'Host URL', type: 'url', placeholder: 'https://sap.acme.corp' },
      { key: 'client', label: 'Client ID', type: 'text' },
      { key: 'username', label: 'Service user', type: 'text' },
      { key: 'password', label: 'Password', type: 'password' },
    ],
  },
  {
    id: 'oracle',
    name: 'Oracle Fusion',
    category: 'erp',
    description: 'Push invoices to Oracle Cloud ERP accounts payable.',
    fields: [
      { key: 'instance', label: 'Instance URL', type: 'url' },
      { key: 'tenant', label: 'Tenant code', type: 'text' },
      { key: 'apiKey', label: 'API key', type: 'password' },
    ],
  },
  {
    id: 'datev',
    name: 'DATEV',
    category: 'erp',
    description: 'Export bookkeeping entries to DATEV Unternehmen online.',
    fields: [
      { key: 'consultant', label: 'Consultant number', type: 'text' },
      { key: 'client', label: 'Client number', type: 'text' },
      { key: 'token', label: 'OAuth token', type: 'password' },
    ],
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'collab',
    description: 'Post approval requests and fraud alerts to a channel.',
    fields: [
      { key: 'webhookUrl', label: 'Incoming webhook URL', type: 'url' },
      { key: 'channel', label: 'Default channel', type: 'text', placeholder: '#invoice-ai' },
    ],
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    category: 'collab',
    description: 'Notify finance teams via Teams connector.',
    fields: [
      { key: 'webhookUrl', label: 'Connector URL', type: 'url' },
      { key: 'team', label: 'Team name', type: 'text' },
    ],
  },
  {
    id: 'webhooks',
    name: 'Custom Webhooks',
    category: 'webhook',
    description: 'Send invoice lifecycle events to your own endpoints.',
    fields: [
      { key: 'url', label: 'Endpoint URL', type: 'url' },
      { key: 'secret', label: 'Signing secret', type: 'password' },
      { key: 'events', label: 'Events (comma-separated)', type: 'text', placeholder: 'invoice.approved,invoice.flagged' },
    ],
  },
];

type StoredIntegrations = Record<string, Record<string, string>>;

function loadIntegrations(): StoredIntegrations {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredIntegrations) : {};
  } catch {
    return {};
  }
}

export default function IntegrationsPage() {
  const [values, setValues] = useState<StoredIntegrations>({});
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    setValues(loadIntegrations());
  }, []);

  const setField = (integrationId: string, key: string, value: string) => {
    setValues((prev) => ({
      ...prev,
      [integrationId]: { ...(prev[integrationId] ?? {}), [key]: value },
    }));
  };

  const saveAll = () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    setSaved('Integration settings saved locally');
    window.setTimeout(() => setSaved(null), 2500);
  };

  const enabledCount = INTEGRATIONS.filter((i) => {
    const cfg = values[i.id];
    return cfg && Object.values(cfg).some((v) => v.trim().length > 0);
  }).length;

  return (
    <InvoiceShell showChat={false}>
      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Integrations</h2>
          <span className={styles.badge}>{enabledCount} configured</span>
        </div>
        <p className={styles.hint}>
          Demo configuration — values are stored in your browser only. Real ERP sync ships in Phase 3 backend.
        </p>
        {saved && <p className={styles.bannerInfo}>{saved}</p>}
      </section>

      <div className={styles.integrationGrid}>
        {INTEGRATIONS.map((integration) => (
          <section key={integration.id} className={styles.integrationCard}>
            <div className={styles.integrationCardHeader}>
              <h3>{integration.name}</h3>
              <span className={styles.badge}>{integration.category}</span>
            </div>
            <p className={styles.hint}>{integration.description}</p>
            <div className={styles.integrationFields}>
              {integration.fields.map((field) => (
                <label key={field.key} className={styles.field}>
                  {field.label}
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={values[integration.id]?.[field.key] ?? ''}
                    onChange={(e) => setField(integration.id, field.key, e.target.value)}
                  />
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className={styles.actionRow} style={{ marginTop: 16 }}>
        <button type="button" className={styles.btn} onClick={saveAll}>
          Save all integrations
        </button>
      </div>
    </InvoiceShell>
  );
}
