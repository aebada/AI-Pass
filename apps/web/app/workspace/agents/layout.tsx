'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import styles from './agents.module.css';

const NAV = [
  { href: '/workspace/agents', label: 'Dashboard' },
  { href: '/workspace/agents/new', label: 'Wizard' },
  { href: '/workspace/agents/skills', label: 'Skills' },
  { href: '/workspace/agents/workflows', label: 'Workflows' },
  { href: '/workspace/agents/execute', label: 'Execute' },
  { href: '/workspace/agents/history', label: 'History' },
  { href: '/workspace/agents/monitoring', label: 'Monitoring' },
  { href: '/workspace/agents/publish', label: 'Publish' },
  { href: '/workspace/agents/settings', label: 'Settings' },
];

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <WorkspaceLayoutClient
      title="Agent Studio"
      subtitle="Professional agent development platform — core intelligence layer for AI-Pass"
    >
      <div className={styles.layout}>
        <nav className={styles.nav}>
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== '/workspace/agents' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? styles.navActive : styles.navLink}
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
