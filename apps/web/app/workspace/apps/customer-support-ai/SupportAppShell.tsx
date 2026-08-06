'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import styles from './support.module.css';

const NAV = [
  { href: '/workspace/apps/customer-support-ai', label: 'Dashboard' },
  { href: '/workspace/apps/customer-support-ai/live-chat', label: 'Live Chat' },
  { href: '/workspace/apps/customer-support-ai/voice', label: 'Voice Console' },
  { href: '/workspace/apps/customer-support-ai/history', label: 'History' },
  { href: '/workspace/apps/customer-support-ai/tickets', label: 'Tickets' },
  { href: '/workspace/apps/customer-support-ai/analytics', label: 'Analytics' },
  { href: '/workspace/apps/customer-support-ai/knowledge', label: 'Knowledge' },
  { href: '/workspace/apps/customer-support-ai/settings', label: 'Settings' },
  { href: '/workspace/apps/customer-support-ai/admin', label: 'Administration' },
];

export function SupportAppShell({
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
    <WorkspaceLayoutClient title={title} subtitle={subtitle}>
      <nav className={styles.nav}>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {children}
    </WorkspaceLayoutClient>
  );
}
