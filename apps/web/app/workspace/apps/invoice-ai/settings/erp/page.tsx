'use client';

import { useCallback, useState } from 'react';
import { defaultERPService, DEMO_TENANT_ID } from '@ai-pass/invoice-ai';
import { ERP_PROVIDER_LABELS, type ERPProvider } from '@ai-pass/erp-connectors';
import { InvoiceShell } from '../../components/InvoiceShell';
import styles from '../../invoice-ai.module.css';

const STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === '1';

type ConnectionRow = ReturnType<typeof defaultERPService.listConnections>[number];

export default function ERPConnectionsPage() {
  const [connections, setConnections] = useState(() =>
    defaultERPService.listConnections(DEMO_TENANT_ID),
  );
  const [showWizard, setShowWizard] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ERPProvider>('xero');
  const [connectionName, setConnectionName] = useState('');
  const [clientSecretRef, setClientSecretRef] = useState('env:XERO_CLIENT_SECRET');
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const auditLogs = defaultERPService.getAuditLogs(DEMO_TENANT_ID);

  const refresh = useCallback(() => {
    setConnections(defaultERPService.listConnections(DEMO_TENANT_ID));
  }, []);

  const apiCall = async (path: string, method = 'POST', body?: unknown) => {
    if (STATIC_EXPORT) return null;
    const res = await fetch(`/api/v1/invoice-ai/erp${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': DEMO_TENANT_ID,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error ?? 'Request failed');
    }
    const json = await res.json();
    return json.data ?? json;
  };

  const handleCreate = async () => {
    if (!connectionName.trim()) {
      setMessage('Connection name is required');
      return;
    }

    setBusy('create');
    setMessage(null);
    try {
      if (STATIC_EXPORT) {
        defaultERPService.createConnection({
          tenantId: DEMO_TENANT_ID,
          provider: selectedProvider,
          name: connectionName,
          credentials: {
            type: 'oauth2',
            clientSecretRef,
            clientId: `${selectedProvider}-client`,
          },
          config: {},
          syncDirection: 'bidirectional',
        });
        refresh();
      } else {
        await apiCall('/connections', 'POST', {
          provider: selectedProvider,
          name: connectionName,
          credentials: { type: 'oauth2', clientSecretRef, clientId: `${selectedProvider}-client` },
          syncDirection: 'bidirectional',
        });
        refresh();
      }
      setShowWizard(false);
      setConnectionName('');
      setMessage('Connection created - run Test to verify credentials');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setBusy(null);
    }
  };

  const handleTest = async (id: string) => {
    setBusy(id);
    setMessage(null);
    try {
      if (STATIC_EXPORT) {
        await defaultERPService.testConnection(id, DEMO_TENANT_ID);
        refresh();
      } else {
        await apiCall(`/connections/${id}/test`);
        refresh();
      }
      setMessage('Connection test completed');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Test failed');
    } finally {
      setBusy(null);
    }
  };

  const handleSync = async (id: string) => {
    setBusy(`sync-${id}`);
    setMessage(null);
    try {
      if (STATIC_EXPORT) {
        await defaultERPService.syncConnection(id, DEMO_TENANT_ID);
        refresh();
      } else {
        await apiCall(`/connections/${id}/sync`);
        refresh();
      }
      setMessage('Sync completed');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setBusy(null);
    }
  };

  const handleHealth = async (id: string) => {
    setBusy(`health-${id}`);
    try {
      const result = STATIC_EXPORT
        ? await defaultERPService.healthCheck(id, DEMO_TENANT_ID)
        : await apiCall(`/connections/${id}/health`, 'GET');
      refresh();
      setMessage(`Health: ${result?.status ?? 'checked'} - ${result?.message ?? ''}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Health check failed');
    } finally {
      setBusy(null);
    }
  };

  return (
    <InvoiceShell showChat={false}>
      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className={styles.cardTitle}>ERP Connections</h2>
            <p className={styles.hint}>
              Connect Oracle, SAP, DATEV, Dynamics, QuickBooks, Xero, or custom APIs. Credentials
              stored via env/vault references - never in code.
            </p>
          </div>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => setShowWizard(true)}
          >
            Add connection
          </button>
        </div>

        {message && <p className={styles.bannerInfo}>{message}</p>}

        <table className={styles.table} style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Provider</th>
              <th>Status</th>
              <th>Last sync</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {connections.map((conn: ConnectionRow) => (
              <tr key={conn.id}>
                <td>{conn.name}</td>
                <td>{conn.providerLabel}</td>
                <td>
                  <span className={`${styles.badge} ${statusClass(conn.status)}`}>
                    {conn.status}
                  </span>
                </td>
                <td>{conn.lastSyncAt ? new Date(conn.lastSyncAt).toLocaleString() : '-'}</td>
                <td className={styles.actionRow}>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    disabled={busy === conn.id}
                    onClick={() => handleTest(conn.id)}
                  >
                    Test
                  </button>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    disabled={busy === `sync-${conn.id}`}
                    onClick={() => handleSync(conn.id)}
                  >
                    Sync
                  </button>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    disabled={busy === `health-${conn.id}`}
                    onClick={() => handleHealth(conn.id)}
                  >
                    Health
                  </button>
                </td>
              </tr>
            ))}
            {connections.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.empty}>
                  No ERP connections configured
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {connections.some((c) => c.lastError) && (
          <section style={{ marginTop: 24 }}>
            <h3 className={styles.cardTitle}>Recent errors</h3>
            <ul className={styles.errorList}>
              {connections
                .filter((c) => c.lastError)
                .map((c) => (
                  <li key={c.id}>
                    <strong>{c.name}:</strong> {c.lastError}
                  </li>
                ))}
            </ul>
          </section>
        )}
      </div>

      {showWizard && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h2>Add ERP connection</h2>
            <label className={styles.field}>
              ERP system
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value as ERPProvider)}
              >
                {Object.entries(ERP_PROVIDER_LABELS).map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              Connection name
              <input
                type="text"
                value={connectionName}
                onChange={(e) => setConnectionName(e.target.value)}
                placeholder="Production Xero"
              />
            </label>
            <label className={styles.field}>
              Secret reference (env var)
              <input
                type="text"
                value={clientSecretRef}
                onChange={(e) => setClientSecretRef(e.target.value)}
                placeholder="env:XERO_CLIENT_SECRET"
              />
            </label>
            <p className={styles.hint}>
              Use <code>env:VAR_NAME</code> to reference secrets from your vault or environment.
            </p>
            <div className={styles.modalActions}>
              <button type="button" className={styles.btnSecondary} onClick={() => setShowWizard(false)}>
                Cancel
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                disabled={busy === 'create'}
                onClick={handleCreate}
              >
                Save &amp; test later
              </button>
            </div>
          </div>
        </div>
      )}

      <section className={styles.card} style={{ marginTop: 24 }}>
        <h2 className={styles.cardTitle}>Sync audit log</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Time</th>
              <th>Action</th>
              <th>Provider</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.slice(0, 10).map((log, idx) => (
              <tr key={`${log.timestamp}-${idx}`}>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.action}</td>
                <td>{log.provider}</td>
                <td>{log.status}</td>
              </tr>
            ))}
            {auditLogs.length === 0 && (
              <tr>
                <td colSpan={4} className={styles.empty}>
                  No audit entries yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </InvoiceShell>
  );
}

function statusClass(status: string): string {
  if (status === 'active') return styles.badgeApproved;
  if (status === 'error') return styles.badgeRejected;
  return styles.badgePending;
}
