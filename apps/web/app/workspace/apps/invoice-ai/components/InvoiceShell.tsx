'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { getExternalProject } from '@ai-pass/platform-core';
import { WorkspaceLayoutClient } from '../../../../components/workspace/WorkspaceLayoutClient';
import { InvoiceChatPanel } from './InvoiceChatPanel';
import styles from '../invoice-ai.module.css';

const INVOICE_AI_SITE = getExternalProject('invoice-ai')?.url ?? 'https://invoice.ehopn.com';

const NAV = [
  { href: '/workspace/apps/invoice-ai', label: 'Dashboard', exact: true },
  { href: '/workspace/apps/invoice-ai/invoices', label: 'Invoices' },
  { href: '/workspace/apps/invoice-ai/upload', label: 'Upload' },
  { href: '/workspace/apps/invoice-ai/approvals', label: 'Approvals' },
  { href: '/workspace/apps/invoice-ai/fraud', label: 'Fraud Center' },
  { href: '/workspace/apps/invoice-ai/workflow', label: 'Workflow' },
  { href: '/workspace/apps/invoice-ai/vendors', label: 'Vendors' },
  { href: '/workspace/apps/invoice-ai/reports', label: 'Reports' },
  { href: '/workspace/apps/invoice-ai/settings', label: 'Settings' },
];

export function InvoiceShell({
  children,
  showChat = true,
}: {
  children: ReactNode;
  showChat?: boolean;
}) {
  const pathname = usePathname();

  return (
    <WorkspaceLayoutClient
      title="Invoice AI"
      subtitle="Enterprise finance automation — extraction, validation, fraud, approvals"
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
          <a
            href={INVOICE_AI_SITE}
            className={styles.subNavLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            Live site ↗
          </a>
        </nav>

        {showChat ? (
          <div className={styles.mainRow}>
            <div className={styles.mainCol}>{children}</div>
            <InvoiceChatPanel />
          </div>
        ) : (
          children
        )}
      </div>
    </WorkspaceLayoutClient>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending_approval: styles.badgePending,
    approved: styles.badgeApproved,
    rejected: styles.badgeRejected,
    flagged: styles.badgeFlagged,
    validated: styles.badgeValidated,
    processing: styles.badgeProcessing,
    paid: styles.badgeApproved,
    draft: styles.badgeProcessing,
  };
  return (
    <span className={`${styles.badge} ${map[status] ?? styles.badgeProcessing}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
