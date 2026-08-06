'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import styles from './sales-ai.module.css';

const NAV = [
  { href: '/workspace/apps/sales-ai', label: 'Dashboard' },
  { href: '/workspace/apps/sales-ai/email', label: 'Email Assistant' },
  { href: '/workspace/apps/sales-ai/linkedin', label: 'LinkedIn' },
  { href: '/workspace/apps/sales-ai/proposals', label: 'Proposals' },
  { href: '/workspace/apps/sales-ai/copilot', label: 'Sales Copilot' },
  { href: '/workspace/apps/sales-ai/meeting-prep', label: 'Meeting Prep' },
  { href: '/workspace/apps/sales-ai/campaigns', label: 'Campaigns' },
  { href: '/workspace/apps/sales-ai/crm', label: 'CRM' },
  { href: '/workspace/apps/sales-ai/analytics', label: 'Analytics' },
  { href: '/workspace/apps/sales-ai/settings', label: 'Settings' },
];

export function SalesAppShell({
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
