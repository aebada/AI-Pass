'use client';

import { useState } from 'react';
import {
  defaultAdminMetricsService,
  DEMO_TENANT_CONTEXT,
  type InvoiceAIRole,
} from '@ai-pass/invoice-ai';
import { useInvoiceAI } from '../components/InvoiceAIProvider';
import { InvoiceShell } from '../components/InvoiceShell';
import styles from '../invoice-ai.module.css';

type AdminTab = 'users' | 'cost' | 'workflows' | 'models' | 'audit';

const TABS: { id: AdminTab; label: string }[] = [
  { id: 'users', label: 'Users & Roles' },
  { id: 'cost', label: 'AI Cost & Tokens' },
  { id: 'workflows', label: 'Workflow Runs' },
  { id: 'models', label: 'Model Statistics' },
  { id: 'audit', label: 'Audit Logs' },
];

const DEMO_USERS: { id: string; name: string; email: string; roles: InvoiceAIRole[]; status: string }[] = [
  { id: 'demo-user', name: 'Jordan Lee', email: 'demo@example.com', roles: ['finance_manager'], status: 'active' },
  { id: 'user_cfo', name: 'David Park', email: 'david.park@acme.corp', roles: ['tenant_admin', 'approver'], status: 'active' },
  { id: 'user_acct', name: 'Maria Santos', email: 'maria.santos@acme.corp', roles: ['accountant'], status: 'active' },
  { id: 'user_audit', name: 'Alex Chen', email: 'alex.chen@acme.corp', roles: ['auditor'], status: 'active' },
  { id: 'user_view', name: 'Sam Rivera', email: 'sam.rivera@acme.corp', roles: ['viewer'], status: 'invited' },
];

function formatRole(role: string): string {
  return role.replace(/_/g, ' ');
}

export default function InvoiceAIAdminPage() {
  const { tenantId, service } = useInvoiceAI();
  const [tab, setTab] = useState<AdminTab>('cost');
  const metrics = defaultAdminMetricsService.getMetrics(tenantId);
  const auditLogs = service.listAuditLogs(tenantId);

  return (
    <InvoiceShell showChat={false}>
      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Platform Admin</h2>
          <span className={styles.badge}>{DEMO_TENANT_CONTEXT.tenantName}</span>
        </div>
        <p className={styles.hint}>
          Tenant metrics and governance for {metrics.period}. Demo data from AdminMetricsService.
        </p>

        <div className={styles.adminTabs} role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`${styles.adminTab} ${tab === t.id ? styles.adminTabActive : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {tab === 'users' && (
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Users &amp; roles (demo)</h3>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Roles</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_USERS.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <div className={styles.roleBadges}>
                        {u.roles.map((r) => (
                          <span key={r} className={styles.roleBadge}>
                            {formatRole(r)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${u.status === 'active' ? styles.badgeApproved : styles.badgeProcessing}`}>
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'cost' && (
        <>
          <section className={styles.card}>
            <div className={styles.summaryRow}>
              <div className={styles.summaryPill}>
                <span className={styles.summaryValue}>${metrics.totalCostUsd.toFixed(2)}</span>
                <span className={styles.summaryLabel}>AI cost</span>
              </div>
              <div className={styles.summaryPill}>
                <span className={styles.summaryValue}>{metrics.totalCredits.toLocaleString()}</span>
                <span className={styles.summaryLabel}>Credits used</span>
              </div>
              <div className={styles.summaryPill}>
                <span className={styles.summaryValue}>{(metrics.totalTokens / 1000).toFixed(0)}k</span>
                <span className={styles.summaryLabel}>Tokens</span>
              </div>
              <div className={styles.summaryPill}>
                <span className={styles.summaryValue}>{metrics.agentRuns}</span>
                <span className={styles.summaryLabel}>Agent runs</span>
              </div>
            </div>
          </section>
          <section className={styles.card}>
            <h3 className={styles.cardTitle}>Active model router</h3>
            <p style={{ margin: 0, fontSize: 15 }}>{metrics.activeModelRouter}</p>
            <p className={styles.hint}>
              {metrics.piiMaskedRequests} requests with PII masked this period
            </p>
          </section>
        </>
      )}

      {tab === 'workflows' && (
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Workflow runs</h3>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Workflow</th>
                  <th>Runs today</th>
                  <th>Success rate</th>
                  <th>Last run</th>
                </tr>
              </thead>
              <tbody>
                {metrics.workflowRuns.map((row) => (
                  <tr key={row.workflowId}>
                    <td>{row.workflowName}</td>
                    <td>{row.runsToday}</td>
                    <td>{row.successRate}%</td>
                    <td>{new Date(row.lastRunAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'models' && (
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Model statistics</h3>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Provider</th>
                  <th>Requests</th>
                  <th>Input tokens</th>
                  <th>Output tokens</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {metrics.tokenUsage.map((row) => (
                  <tr key={row.modelId}>
                    <td>{row.modelId}</td>
                    <td>{row.providerId}</td>
                    <td>{row.requests}</td>
                    <td>{row.inputTokens.toLocaleString()}</td>
                    <td>{row.outputTokens.toLocaleString()}</td>
                    <td>${row.costUsd.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'audit' && (
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Audit logs</h3>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Credits</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td>{log.actorName}</td>
                    <td>{log.action}</td>
                    <td>
                      {log.entityType}/{log.entityId}
                    </td>
                    <td>{log.creditsUsed ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </InvoiceShell>
  );
}
