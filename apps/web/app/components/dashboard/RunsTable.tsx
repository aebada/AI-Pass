'use client';

import { useMemo, useState } from 'react';
import styles from './RunsTable.module.css';
import type { AgentRun, RunStatus } from './dashboardData';

type Tab = 'all' | RunStatus;

const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'ALL' },
  { id: 'running', label: 'Running' },
  { id: 'queued', label: 'Queued' },
  { id: 'failed', label: 'Failed' },
];

const STATUS_LABEL: Record<RunStatus, string> = {
  running: 'Running',
  done: 'Done',
  queued: 'Queued',
  failed: 'Failed',
};

function statusIcon(status: RunStatus): string {
  if (status === 'done') return '✓';
  if (status === 'failed') return '✕';
  if (status === 'running') return '◉';
  return '○';
}

interface Props {
  runs: AgentRun[];
  subtitle?: string;
}

export function RunsTable({ runs, subtitle }: Props) {
  const [tab, setTab] = useState<Tab>('all');

  const filtered = useMemo(() => {
    if (tab === 'all') return runs;
    return runs.filter((r) => r.status === tab);
  }, [runs, tab]);

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Active &amp; recent runs</h2>
          <p className={styles.subtitle}>{subtitle ?? (runs.length === 0 ? 'No runs yet — try the Playground' : 'Your recent agent runs')}</p>
        </div>
        <div className={styles.tabs}>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.colIcon} aria-label="Status" />
              <th>Task</th>
              <th>Agent</th>
              <th>Status</th>
              <th className={styles.colTime}>Time</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.empty}>
                  No runs match this filter.
                </td>
              </tr>
            ) : (
              filtered.map((run) => (
                <tr key={run.id}>
                  <td className={styles.colIcon}>
                    <span className={`${styles.icon} ${styles[`icon_${run.status}`]}`}>
                      {statusIcon(run.status)}
                    </span>
                  </td>
                  <td className={styles.task}>{run.task}</td>
                  <td className={styles.agent}>{run.agent}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[`badge_${run.status}`]}`}>
                      {STATUS_LABEL[run.status]}
                    </span>
                  </td>
                  <td className={styles.colTime}>{run.timeAgo}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
