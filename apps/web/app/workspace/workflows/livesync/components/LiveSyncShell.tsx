'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { WorkspaceLayoutClient } from '../../../../components/workspace/WorkspaceLayoutClient';
import styles from '../livesync.module.css';

const NAV = [
  { href: '/workspace/workflows/livesync', label: 'Dashboard' },
  { href: '/workspace/workflows/livesync/events', label: 'Events' },
  { href: '/workspace/workflows/livesync/queue', label: 'Queue' },
  { href: '/workspace/workflows/livesync/triggers', label: 'Triggers' },
  { href: '/workspace/workflows/livesync/workflows', label: 'Workflows' },
  { href: '/workspace/workflows/livesync/agents', label: 'Agents' },
  { href: '/workspace/workflows/livesync/replay', label: 'Replay' },
  { href: '/workspace/workflows/livesync/logs', label: 'Logs' },
  { href: '/workspace/workflows/livesync/monitoring', label: 'Monitoring' },
  { href: '/workspace/workflows/livesync/admin', label: 'Admin' },
];

export function LiveSyncShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
}) {
  const pathname = usePathname();

  return (
    <WorkspaceLayoutClient title={title} subtitle={subtitle ?? 'Real-time event-driven AI orchestration'}>
      <nav className={styles.livesyncNav}>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={pathname === item.href ? styles.active : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {children}
    </WorkspaceLayoutClient>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const cls =
    status === 'processed' || status === 'completed' || status === 'ok' || status === 'healthy'
      ? styles.badgeOk
      : status === 'failed' || status === 'error'
        ? styles.badgeErr
        : styles.badgeWarn;
  return <span className={`${styles.badge} ${cls}`}>{status}</span>;
}
