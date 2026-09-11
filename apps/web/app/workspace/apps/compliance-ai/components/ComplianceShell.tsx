'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { WorkspaceLayoutClient } from '../../../../components/workspace/WorkspaceLayoutClient';
import { ComplianceCopilotPanel } from './ComplianceCopilotPanel';
import styles from '../compliance-ai.module.css';

const NAV = [
  { href: '/workspace/apps/compliance-ai', label: 'Dashboard', exact: true },
  { href: '/workspace/apps/compliance-ai/frameworks', label: 'Frameworks' },
  { href: '/workspace/apps/compliance-ai/controls', label: 'Controls & Tasks' },
  { href: '/workspace/apps/compliance-ai/risks', label: 'Risk Register' },
  { href: '/workspace/apps/compliance-ai/vendors', label: 'Vendors' },
  { href: '/workspace/apps/compliance-ai/employees', label: 'Employee Compliance' },
  { href: '/workspace/apps/compliance-ai/policies', label: 'Policy Center' },
  { href: '/workspace/apps/compliance-ai/evidence', label: 'Evidence Library' },
  { href: '/workspace/apps/compliance-ai/trust-center', label: 'Trust Center' },
  { href: '/workspace/apps/compliance-ai/reports', label: 'Reports' },
  { href: '/workspace/apps/compliance-ai/copilot', label: 'AI Copilot' },
  { href: '/workspace/apps/compliance-ai/admin', label: 'Administration' },
];

export function ComplianceShell({
  children,
  showCopilot = false,
}: {
  children: ReactNode;
  showCopilot?: boolean;
}) {
  const pathname = usePathname();

  return (
    <WorkspaceLayoutClient
      title="Compliance AI"
      subtitle="Enterprise compliance operations - frameworks, risks, evidence, and trust"
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

        {showCopilot ? (
          <div className={styles.mainRow}>
            <div>{children}</div>
            <ComplianceCopilotPanel />
          </div>
        ) : (
          children
        )}
      </div>
    </WorkspaceLayoutClient>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    critical: styles.badgeHigh,
    high: styles.badgeHigh,
    medium: styles.badgeMedium,
    low: styles.badgeLow,
  };
  return (
    <span className={`${styles.badge} ${map[severity] ?? styles.badgeDefault}`}>
      {severity}
    </span>
  );
}
