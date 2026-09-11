'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { WorkspaceLayoutClient } from '../../../../components/workspace/WorkspaceLayoutClient';
import styles from '../presence-audit.module.css';

const NAV = [
  { href: '/workspace/apps/presence-audit', label: 'Dashboard', exact: true },
  { href: '/workspace/apps/presence-audit/company', label: 'Company Setup' },
  { href: '/workspace/apps/presence-audit/competitors', label: 'Competitors' },
  { href: '/workspace/apps/presence-audit/results', label: 'Audit Results' },
  { href: '/workspace/apps/presence-audit/providers', label: 'Provider Comparison' },
  { href: '/workspace/apps/presence-audit/optimize', label: 'Optimization' },
  { href: '/workspace/apps/presence-audit/monitoring', label: 'Monitoring' },
  { href: '/workspace/apps/presence-audit/reports', label: 'Reports' },
  { href: '/workspace/apps/presence-audit/history', label: 'History' },
  { href: '/workspace/apps/presence-audit/admin', label: 'Administration' },
];

export function PresenceAuditShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <WorkspaceLayoutClient
      title="Presence Audit"
      subtitle="AI Visibility Intelligence - ChatGPT, Claude, Gemini, Perplexity"
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

export function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    critical: styles.badgeCritical,
    medium: styles.badgeMedium,
    low: styles.badgeLow,
  };
  return (
    <span className={`${styles.badge} ${map[severity] ?? styles.badgeLow}`}>
      {severity}
    </span>
  );
}

export function ProviderBadge({ provider }: { provider: string }) {
  const map: Record<string, string> = {
    openai: styles.badgeOpenai,
    anthropic: styles.badgeAnthropic,
    google: styles.badgeGoogle,
    perplexity: styles.badgePerplexity,
  };
  const labels: Record<string, string> = {
    openai: 'ChatGPT',
    anthropic: 'Claude',
    google: 'Gemini',
    perplexity: 'Perplexity',
  };
  return (
    <span className={`${styles.badge} ${map[provider] ?? ''}`}>
      {labels[provider] ?? provider}
    </span>
  );
}
