'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { WorkspaceDashboardData } from '@ai-pass/platform-core';
import { getDemoDashboard } from '@ai-pass/platform-core';
import { Card, workspaceTokens } from '@ai-pass/ui';
import { useApp } from '../premium/AppProviders';
import { WalletCredits } from '../dashboard/WalletCredits';
import { PendingApprovals } from '../dashboard/PendingApprovals';
import { KpiCards } from '../dashboard/KpiCards';
import { KPI_METRICS } from '../dashboard/dashboardData';
import { WorkspaceAppsCatalog } from './WorkspaceAppsCatalog';
import styles from '../../dashboard/page.module.css';

function EmptySection({ title, message }: { title: string; message: string }) {
  return (
    <p style={{ margin: 0, fontSize: 13, color: workspaceTokens.colors.textMuted }}>
      <strong style={{ color: workspaceTokens.colors.text }}>{title}</strong>
      {' - '}
      {message}
    </p>
  );
}

async function loadDashboard(): Promise<WorkspaceDashboardData> {
  try {
    const res = await fetch('/api/v1/workspace/summary', {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return getDemoDashboard();
    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) return getDemoDashboard();
    const payload = await res.json();
    const dashboard = payload?.data?.dashboard as WorkspaceDashboardData | undefined;
    return dashboard ?? getDemoDashboard();
  } catch {
    return getDemoDashboard();
  }
}

export function WorkspaceHome() {
  const { user } = useApp();
  const [dash, setDash] = useState<WorkspaceDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    loadDashboard()
      .then((dashboard) => {
        if (!cancelled) setDash(dashboard);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  if (loading) {
    return (
      <div className={styles.container}>
        <p style={{ color: workspaceTokens.colors.textMuted }}>Loading your workspace…</p>
      </div>
    );
  }

  if (!dash) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Welcome, {firstName}</h1>
            <p className={styles.subtitle}>Sign in to load your workspace overview.</p>
          </div>
        </header>
        <WorkspaceAppsCatalog />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Workspace</h1>
          <p className={styles.subtitle}>
            Welcome, {firstName} — browse AI applications with trust scores, then manage usage, cost,
            agents, and governance.
          </p>
        </div>
      </header>

      <WorkspaceAppsCatalog />

      <section style={{ marginBottom: 24 }}>
        <KpiCards metrics={KPI_METRICS} />
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: workspaceTokens.colors.textMuted, marginBottom: 12 }}>
          Quick Actions
        </h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {dash.quickActions.map((a) => (
            <Link
              key={a.id}
              href={a.route}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 8,
                border: `1px solid ${workspaceTokens.colors.border}`,
                background: workspaceTokens.colors.bgElevated,
                color: workspaceTokens.colors.text,
                fontSize: 13,
                textDecoration: 'none',
              }}
            >
              <span>{a.icon}</span>
              {a.label}
            </Link>
          ))}
        </div>
      </section>

      <div className={styles.mainGrid}>
        <div className={styles.mainCol}>
          <Card padding="md" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Recent Tasks</h3>
            {dash.recentTasks.length === 0 ? (
              <EmptySection title="No tasks yet" message="Run a workflow or agent to see activity here." />
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {dash.recentTasks.map((t) => (
                  <li key={t.id} style={{ padding: '8px 0', borderBottom: `1px solid ${workspaceTokens.colors.border}` }}>
                    <Link href={t.route ?? '/workspace'} style={{ color: workspaceTokens.colors.text, textDecoration: 'none' }}>
                      <strong>{t.title}</strong>
                      <span style={{ color: workspaceTokens.colors.textMuted, marginLeft: 8, fontSize: 12 }}>
                        {t.module} · {t.status} · {t.updatedAt}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card padding="md" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Running Workflows</h3>
            {dash.runningWorkflows.length === 0 ? (
              <EmptySection title="No workflows running" message="Create a workflow to automate multi-step tasks." />
            ) : (
              dash.runningWorkflows.map((w) => (
                <div key={w.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <Link href={w.route} style={{ color: workspaceTokens.colors.text, textDecoration: 'none' }}>
                      {w.name}
                    </Link>
                    <span style={{ color: workspaceTokens.colors.textMuted }}>
                      {w.stepsCompleted}/{w.stepsTotal} steps
                    </span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: workspaceTokens.colors.border, marginTop: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${(w.stepsCompleted / w.stepsTotal) * 100}%`, height: '100%', background: workspaceTokens.colors.accent }} />
                  </div>
                </div>
              ))
            )}
          </Card>

          <Card padding="md">
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Activity</h3>
            {dash.activity.length === 0 ? (
              <EmptySection title="Getting started" message="Your recent actions will appear here." />
            ) : (
              dash.activity.map((a) => (
                <div key={a.id} style={{ padding: '6px 0', fontSize: 13, color: workspaceTokens.colors.textMuted }}>
                  <strong style={{ color: workspaceTokens.colors.text }}>{a.actor}</strong> {a.action}
                  <span style={{ marginLeft: 8 }}>{a.timestamp}</span>
                </div>
              ))
            )}
          </Card>
        </div>

        <aside className={styles.sideCol}>
          <WalletCredits
            spent={dash.credits.spendUsd}
            budget={dash.credits.budgetUsd}
            daysLeft={dash.credits.daysLeft}
            breakdown={[]}
          />

          <Card padding="md" style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Notifications</h3>
            {dash.notifications.map((n) => (
              <div key={n.id} style={{ padding: '8px 0', borderBottom: `1px solid ${workspaceTokens.colors.border}`, opacity: n.read ? 0.7 : 1 }}>
                <Link href={n.route ?? '/workspace'} style={{ color: workspaceTokens.colors.text, textDecoration: 'none', fontSize: 13 }}>
                  <strong>{n.title}</strong>
                  <p style={{ margin: '2px 0 0', color: workspaceTokens.colors.textMuted, fontSize: 12 }}>{n.body} · {n.time}</p>
                </Link>
              </div>
            ))}
          </Card>

          <PendingApprovals
            approvals={dash.approvals.map((a) => ({
              id: a.id,
              title: a.title,
              agent: a.module,
              policy: `Risk: ${a.risk}`,
              timeAgo: a.createdAt,
            }))}
            subtitle={dash.approvals.length === 0 ? 'No pending approvals' : undefined}
            onApprove={() => {}}
            onReject={() => {}}
          />

          <Card padding="md" style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Insights</h3>
            {dash.insights.map((i) => (
              <div key={i.id} style={{ padding: '8px 0', fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ color: workspaceTokens.colors.text }}>{i.title}</strong>
                  {i.metric && <span style={{ color: workspaceTokens.colors.textMuted }}>{i.metric}</span>}
                </div>
                <p style={{ margin: '2px 0 0', color: workspaceTokens.colors.textMuted, fontSize: 12 }}>{i.description}</p>
              </div>
            ))}
          </Card>

          <Card padding="md" style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Recommendations</h3>
            {dash.recommendations.map((r) => (
              <Link key={r.id} href={r.route} style={{ display: 'flex', gap: 10, padding: '8px 0', color: workspaceTokens.colors.text, textDecoration: 'none', fontSize: 13 }}>
                <span>{r.icon}</span>
                <div>
                  <strong>{r.title}</strong>
                  <p style={{ margin: 0, color: workspaceTokens.colors.textMuted, fontSize: 12 }}>{r.description}</p>
                </div>
              </Link>
            ))}
          </Card>

          <Card padding="md" style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Recent Agents</h3>
            {dash.recentAgents.length === 0 ? (
              <EmptySection title="No agents yet" message="Create your first agent in Agent Studio." />
            ) : (
              dash.recentAgents.map((a) => (
                <Link key={a.id} href={a.route} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: workspaceTokens.colors.text, textDecoration: 'none', fontSize: 13 }}>
                  <span>{a.name}</span>
                  <span style={{ color: a.status === 'running' ? workspaceTokens.colors.success : workspaceTokens.colors.textMuted }}>{a.status}</span>
                </Link>
              ))
            )}
          </Card>

          <Card padding="md" style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 8px' }}>Governance</h3>
            <p style={{ fontSize: 12, color: workspaceTokens.colors.textMuted, margin: '0 0 12px' }}>
              Trust Center and policy controls for every installed AI application.
            </p>
            <Link href="/workspace/trust" style={{ color: workspaceTokens.colors.accent, fontSize: 13, textDecoration: 'none', display: 'block' }}>
              Trust Center →
            </Link>
            <Link href="/workspace/governance" style={{ color: workspaceTokens.colors.accent, fontSize: 13, textDecoration: 'none', display: 'block', marginTop: 6 }}>
              Governance Center →
            </Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}
