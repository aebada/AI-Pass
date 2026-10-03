import Link from 'next/link';
import type { ReactNode } from 'react';
import { PremiumNav } from '../../components/premium/PremiumNav';
import {
  LAB_CONTACT_MAILTO,
  LAB_EMAIL,
  RESEARCH_NAV,
  showGovernance,
} from '../../lib/hopn-lab';
import { FOOTER_COLUMNS } from '../../lib/site-nav';
import styles from '../research.module.css';

export function ResearchShell({
  path,
  crumbs,
  children,
}: {
  path: string;
  crumbs: { href: string; label: string }[];
  children: ReactNode;
}) {
  const nav = showGovernance()
    ? [...RESEARCH_NAV, { href: '/research/governance', label: 'Governance' }]
    : RESEARCH_NAV;

  return (
    <div className={styles.page}>
      <PremiumNav variant="landing" />
      <div className={styles.wrap}>
        <nav className={styles.subnav} aria-label="Research section">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={path === item.href ? styles.subnavActive : undefined}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/demo">Interactive demo</Link>
        </nav>
        <nav className={styles.crumbs} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          {crumbs.map((c, i) => (
            <span key={c.href}>
              {i > 0 ? <span> / </span> : null}
              {i === crumbs.length - 1 ? c.label : <Link href={c.href}>{c.label}</Link>}
            </span>
          ))}
        </nav>
        {children}
        <div className={styles.contactBar}>
          <p>
            Questions? Email <a href={LAB_CONTACT_MAILTO}>{LAB_EMAIL}</a>
          </p>
          <div className={styles.ctaRow}>
            <a className={styles.btnPrimary} href={LAB_CONTACT_MAILTO}>
              Contact the lab
            </a>
            <Link className={styles.btnSecondary} href="/demo">
              Try the demo
            </Link>
          </div>
        </div>
        <footer style={{ padding: '2rem 0 3rem', color: 'var(--text-muted)', fontSize: 13 }}>
          <div>
            {FOOTER_COLUMNS.find((column) => column.title === 'Research')?.links.slice(0, 8).map((l) => (
              <Link key={`${l.href}-${l.label}`} href={l.href} style={{ marginInlineEnd: 12 }}>
                {l.label}
              </Link>
            ))}
          </div>
          <p>HOPN Lab is the research arm of HOPN UG.</p>
        </footer>
      </div>
    </div>
  );
}
