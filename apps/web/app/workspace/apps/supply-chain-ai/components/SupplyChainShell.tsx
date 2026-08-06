'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import styles from '../supply-chain-shell.module.css';
import { ModuleIcon } from '@ai-pass/ui';

const NAV = [
  { href: '/workspace/apps/supply-chain-ai', label: 'Dashboard', icon: 'bar-chart-3' },
  { href: '/workspace/apps/supply-chain-ai/events', label: 'Sourcing Events', icon: 'clipboard-list' },
  { href: '/workspace/apps/supply-chain-ai/offers', label: 'Supplier Offers', icon: 'file-text' },
  { href: '/workspace/apps/supply-chain-ai/evaluation', label: 'Evaluation', icon: 'scale' },
  { href: '/workspace/apps/supply-chain-ai/comparison', label: 'Comparison', icon: 'trending-up' },
  { href: '/workspace/apps/supply-chain-ai/evidence', label: 'Evidence', icon: 'search' },
  { href: '/workspace/apps/supply-chain-ai/chat', label: 'Chat', icon: 'message-circle' },
  { href: '/workspace/apps/supply-chain-ai/approvals', label: 'Approvals', icon: 'check' },
  { href: '/workspace/apps/supply-chain-ai/reports', label: 'Reports', icon: 'file-text' },
  { href: '/workspace/apps/supply-chain-ai/settings', label: 'Settings', icon: 'settings' },
];

export function SupplyChainShell({ children, title }: { children: ReactNode; title?: string }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <div
      className={styles.shell}
      data-sc-nav={mobileNavOpen ? 'open' : 'closed'}
    >
      {mobileNavOpen && (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <aside className={`${styles.sidebar} ${mobileNavOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}><ModuleIcon name="package" size={18} /></span>
          <div>
            <div className={styles.brandTitle}>Supply Chain AI</div>
            <div className={styles.brandSub}>Procurement & Evaluation</div>
          </div>
        </div>
        <nav className={styles.nav}>
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== '/workspace/apps/supply-chain-ai' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? styles.navActive : styles.navItem}
                onClick={() => setMobileNavOpen(false)}
              >
                <span><ModuleIcon name={item.icon} size={16} /></span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link href="/workspace" className={styles.backLink}>← Workspace</Link>
      </aside>
      <main className={styles.main}>
        <div className={styles.mobileBar}>
          <button
            type="button"
            className={styles.menuBtn}
            aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((o) => !o)}
          >
            <ModuleIcon name={mobileNavOpen ? 'x' : 'menu'} size={18} />
          </button>
          {title && <h1 className={styles.mobileTitle}>{title}</h1>}
        </div>
        {title && (
          <header className={styles.header}>
            <h1>{title}</h1>
          </header>
        )}
        {children}
      </main>
    </div>
  );
}
