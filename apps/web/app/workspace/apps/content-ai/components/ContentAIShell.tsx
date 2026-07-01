'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { WorkspaceLayoutClient } from '../../../../components/workspace/WorkspaceLayoutClient';
import styles from '../content-ai.module.css';

const NAV = [
  { href: '/workspace/apps/content-ai', label: 'Dashboard', exact: true },
  { href: '/workspace/apps/content-ai/detect', label: 'AI Detector' },
  { href: '/workspace/apps/content-ai/humanize', label: 'Humanizer' },
  { href: '/workspace/apps/content-ai/history', label: 'History' },
  { href: '/workspace/apps/content-ai/api', label: 'API' },
  { href: '/workspace/apps/content-ai/pricing', label: 'Pricing' },
  { href: '/workspace/apps/content-ai/settings', label: 'Settings' },
];

export function ContentAIShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <WorkspaceLayoutClient
      title="Content AI"
      subtitle="Detect AI. Humanize with Confidence. — AI Detector & Humanizer"
    >
      <div className={styles.app}>
        <nav className={styles.subNav}>
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.subNavLink} ${active ? styles.subNavLinkActive : ''}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        {children}
      </div>
    </WorkspaceLayoutClient>
  );
}

export function ScoreBadge({ label, score }: { label: 'ai' | 'human' | 'mixed'; score: number }) {
  const cls =
    label === 'ai' ? styles.badgeAi :
    label === 'human' ? styles.badgeHuman : styles.badgeMixed;
  return (
    <span className={`${styles.badge} ${cls}`}>
      {label} {score}%
    </span>
  );
}
