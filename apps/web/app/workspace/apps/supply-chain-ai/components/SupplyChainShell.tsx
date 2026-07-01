'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import styles from '../supply-chain-shell.module.css';

const NAV = [
  { href: '/workspace/apps/supply-chain-ai', label: 'Dashboard', icon: '📊' },
  { href: '/workspace/apps/supply-chain-ai/events', label: 'Sourcing Events', icon: '📋' },
  { href: '/workspace/apps/supply-chain-ai/offers', label: 'Supplier Offers', icon: '📄' },
  { href: '/workspace/apps/supply-chain-ai/evaluation', label: 'Evaluation', icon: '⚖️' },
  { href: '/workspace/apps/supply-chain-ai/comparison', label: 'Comparison', icon: '📈' },
  { href: '/workspace/apps/supply-chain-ai/evidence', label: 'Evidence', icon: '🔍' },
  { href: '/workspace/apps/supply-chain-ai/chat', label: 'Chat', icon: '💬' },
  { href: '/workspace/apps/supply-chain-ai/approvals', label: 'Approvals', icon: '✅' },
  { href: '/workspace/apps/supply-chain-ai/reports', label: 'Reports', icon: '📑' },
  { href: '/workspace/apps/supply-chain-ai/settings', label: 'Settings', icon: '⚙️' },
];

export function SupplyChainShell({ children, title }: { children: ReactNode; title?: string }) {
  const pathname = usePathname();

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>📦</span>
          <div>
            <div className={styles.brandTitle}>Supply Chain AI</div>
            <div className={styles.brandSub}>Procurement & Evaluation</div>
          </div>
        </div>
        <nav className={styles.nav}>
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== '/workspace/apps/supply-chain-ai' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={active ? styles.navActive : styles.navItem}>
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link href="/workspace" className={styles.backLink}>← Workspace</Link>
      </aside>
      <main className={styles.main}>
        {title && <header className={styles.header}><h1>{title}</h1></header>}
        {children}
      </main>
    </div>
  );
}
