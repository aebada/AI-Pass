'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { WorkspaceDashboardData } from '@ai-pass/platform-core';
import { EXTERNAL_PROJECT_LINKS } from '@ai-pass/platform-core';
import { Card, ModuleIcon, workspaceTokens } from '@ai-pass/ui';
import { fetchWorkspaceSummary, fallbackWorkspaceSummary } from '@/lib/workspace-summary';
import { useAuthSession } from '@/lib/use-auth-session';
import { SignInCard } from '../auth/SignInCard';
import { useApp } from '../premium/AppProviders';
import { WalletCredits } from '../dashboard/WalletCredits';
import { PendingApprovals } from '../dashboard/PendingApprovals';
import styles from './workspace-home.module.css';
import { IntegrationStatus } from './IntegrationStatus';

function EmptySection({ title, message }: { title: string; message: string }) {
  return (
    <p className={styles.empty}>
      <strong>{title}</strong>
      {' — '}
      {message}
    </p>
  );
}

export function WorkspaceHome() {
  const { user } = useApp();
  const { isAuthenticated, isLoading: authLoading } = useAuthSession();
  const signedIn = Boolean(user) || isAuthenticated;
  const [dash, setDash] = useState<WorkspaceDashboardData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [authTimedOut, setAuthTimedOut] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      setAuthTimedOut(false);
      return;
    }
    const timer = window.setTimeout(() => setAuthTimedOut(true), 3000);
    return () => window.clearTimeout(timer);
  }, [authLoading]);

  const waitingForAuth = authLoading && !user && !authTimedOut;

  useEffect(() => {
    if (authLoading || !signedIn) {
      setDash(null);
      setSummaryLoading(false);
      return;
    }

    let cancelled = false;
    setSummaryLoading(true);

    fetchWorkspaceSummary()
      .then((dashboard) => {
        if (!cancelled) setDash(dashboard);
      })
      .catch(() => {
        if (!cancelled) setDash(null);
      })
      .finally(() => {
        if (!cancelled) setSummaryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, signedIn, user?.id]);

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  if (waitingForAuth) {
    return (
      <div className={styles.container}>
        <p style={{ color: workspaceTokens.colors.textMuted }}>Loading your workspace…</p>
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Workspace</h1>
            <p className={styles.subtitle}>Sign in to access your unified AI workspace.</p>
          </div>
        </header>
        <SignInCard returnUrl="/workspace" variant="gate" />
      </div>
    );
  }

  const dashboard = dash ?? fallbackWorkspaceSummary(user?.name);
  void summaryLoading;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Welcome, {firstName}</h1>
          <p className={styles.subtitle}>
            Tasks, agents, workflows, and credits — at a glance.
          </p>
        </div>
      </header>

      <section>
        <h2 className={styles.sectionLabel}>Quick actions</h2>
        <div className={styles.quickActions}>
          {dashboard.quickActions.map((a) => (
            <Link key={a.id} href={a.route} className={styles.quickAction}>
              <ModuleIcon name={a.icon} size={16} />
              {a.label}
            </Link>
          ))}
        </div>
      </section>

      <IntegrationStatus />

      <section>
        <h2 className={styles.sectionLabel}>External projects</h2>
        <div className={styles.quickActions}>
          {EXTERNAL_PROJECT_LINKS.map((project) => (
            <a
              key={project.id}
              href={project.url}
              className={styles.quickAction}
              target="_blank"
              rel="noopener noreferrer"
              title={project.description}
            >
              <ModuleIcon name={project.icon ?? 'link'} size={16} />
              {project.label}
            </a>
          ))}
        </div>
      </section>

      <div className={styles.mainGrid}>
        <div className={styles.mainCol}>
          <Card padding="md">
            <h3 className={styles.panelTitle}>Recent tasks</h3>
            {dashboard.recentTasks.length === 0 ? (
              <EmptySection title="No tasks yet" message="Run a workflow or agent to see activity here." />
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {dashboard.recentTasks.map((t) => (
                  <li key={t.id} className={styles.listItem}>
                    <Link href={t.route ?? '#'} className={styles.listLink}>
                      <strong>{t.title}</strong>
                      <span className={styles.meta}>
                        {t.module} · {t.status} · {t.updatedAt}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card padding="md">
            <h3 className={styles.panelTitle}>Running workflows</h3>
            {dashboard.runningWorkflows.length === 0 ? (
              <EmptySection title="No workflows running" message="Create a workflow to automate multi-step tasks." />
            ) : (
              dashboard.runningWorkflows.map((w) => (
                <div key={w.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <Link href={w.route} className={styles.listLink}>
                      {w.name}
                    </Link>
                    <span style={{ color: workspaceTokens.colors.textMuted }}>
                      {w.stepsCompleted}/{w.stepsTotal} steps
                    </span>
                  </div>
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${(w.stepsCompleted / w.stepsTotal) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </Card>

          <Card padding="md">
            <h3 className={styles.panelTitle}>Activity</h3>
            {dashboard.activity.length === 0 ? (
              <EmptySection title="Getting started" message="Your recent actions will appear here." />
            ) : (
              dashboard.activity.map((a) => (
                <div key={a.id} className={styles.activityRow}>
                  <strong>{a.actor}</strong> {a.action}
                  <span style={{ marginLeft: 8 }}>{a.timestamp}</span>
                </div>
              ))
            )}
          </Card>
        </div>

        <aside className={styles.sideCol}>
          <WalletCredits
            spent={dashboard.credits.spendUsd}
            budget={dashboard.credits.budgetUsd}
            daysLeft={dashboard.credits.daysLeft}
            breakdown={[]}
          />

          <Card padding="md">
            <h3 className={styles.panelTitle}>Notifications</h3>
            {dashboard.notifications.map((n) => (
              <div key={n.id} className={styles.listItem} style={{ opacity: n.read ? 0.7 : 1 }}>
                <Link href={n.route ?? '#'} className={styles.listLink}>
                  <strong>{n.title}</strong>
                  <p style={{ margin: '2px 0 0', color: workspaceTokens.colors.textMuted, fontSize: 12 }}>
                    {n.body} · {n.time}
                  </p>
                </Link>
              </div>
            ))}
          </Card>

          <PendingApprovals
            approvals={dashboard.approvals.map((a) => ({
              id: a.id,
              title: a.title,
              agent: a.module,
              policy: `Risk: ${a.risk}`,
              timeAgo: a.createdAt,
            }))}
            subtitle={dashboard.approvals.length === 0 ? 'No pending approvals' : undefined}
            onApprove={() => {}}
            onReject={() => {}}
          />

          <Card padding="md">
            <h3 className={styles.panelTitle}>Insights</h3>
            {dashboard.insights.map((i) => (
              <div key={i.id} className={styles.insightRow}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ color: workspaceTokens.colors.text }}>{i.title}</strong>
                  {i.metric && <span style={{ color: workspaceTokens.colors.textMuted }}>{i.metric}</span>}
                </div>
                <p>{i.description}</p>
              </div>
            ))}
          </Card>

          <Card padding="md">
            <h3 className={styles.panelTitle}>Recommendations</h3>
            {dashboard.recommendations.map((r) => (
              <Link key={r.id} href={r.route} className={styles.recLink}>
                <ModuleIcon name={r.icon} size={16} />
                <div>
                  <strong>{r.title}</strong>
                  <p>{r.description}</p>
                </div>
              </Link>
            ))}
          </Card>

          <Card padding="md">
            <h3 className={styles.panelTitle}>Recent agents</h3>
            {dashboard.recentAgents.length === 0 ? (
              <EmptySection title="No agents yet" message="Create your first agent in Agent Studio." />
            ) : (
              dashboard.recentAgents.map((a) => (
                <Link
                  key={a.id}
                  href={a.route}
                  className={styles.listLink}
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}
                >
                  <span>{a.name}</span>
                  <span
                    style={{
                      color:
                        a.status === 'running'
                          ? workspaceTokens.colors.success
                          : workspaceTokens.colors.textMuted,
                    }}
                  >
                    {a.status}
                  </span>
                </Link>
              ))
            )}
          </Card>

          <Card padding="md">
            <h3 className={styles.panelTitle}>Marketplace</h3>
            <p style={{ fontSize: 12, color: workspaceTokens.colors.textMuted, margin: '0 0 12px' }}>
              Install Invoice AI, Supply Chain AI, and more
            </p>
            <Link href="/workspace/marketplace" className={styles.mutedLink}>
              Browse Marketplace →
            </Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}
