'use client';

import Link from 'next/link';
import { PremiumNav } from '../components/premium/PremiumNav';
import { BrandLogoLink } from '../components/BrandLogoLink';
import { FOOTER_COLUMNS } from '../lib/site-nav';
import { LAB_DEMO_MAILTO, LAB_PRODUCTS } from './lab-data';
import styles from './lab.module.css';
import homeStyles from '../page.module.css';

type LabShellProps = {
  activeSlug?: (typeof LAB_PRODUCTS)[number]['slug'];
  children: React.ReactNode;
};

export function LabShell({ activeSlug, children }: LabShellProps) {
  return (
    <div className={styles.page}>
      <PremiumNav variant="landing" />
      <div className={styles.section} style={{ paddingTop: 20, paddingBottom: 0 }}>
        <nav className={styles.subnav} aria-label="Intelligence Lab">
          <Link href="/lab" data-active={!activeSlug ? 'true' : 'false'}>
            Overview
          </Link>
          {LAB_PRODUCTS.map((product) => (
            <Link
              key={product.slug}
              href={product.href}
              data-active={activeSlug === product.slug ? 'true' : 'false'}
            >
              {product.name}
            </Link>
          ))}
        </nav>
      </div>
      {children}
      <section className={styles.finalCta} aria-labelledby="lab-final-cta">
        <h2 id="lab-final-cta">Own the expert data layer for your agents</h2>
        <p>
          AI-Pass Intelligence Lab is built into the same infrastructure as twins, routing, and
          Trust Engine — not a bolted-on vendor partnership.
        </p>
        <div className={styles.ctas}>
          <a href={LAB_DEMO_MAILTO} className={styles.btnOnDark}>
            Book lab demo
          </a>
          <Link href="/workspace" className={styles.btnOnDarkGhost}>
            Open workspace
          </Link>
        </div>
      </section>
      <footer className={homeStyles.footer}>
        <div className={homeStyles.footerTop}>
          <BrandLogoLink />
          <p className={homeStyles.footerTag}>Enterprise AI Infrastructure Platform</p>
        </div>
        <div className={homeStyles.footerGrid}>
          {FOOTER_COLUMNS.slice(0, 5).map((column) => (
            <div key={column.title} className={homeStyles.footerCol}>
              <h3>{column.title}</h3>
              <ul>
                {column.links.slice(0, 6).map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    {link.external ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer">
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href}>{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className={homeStyles.footerBottom}>
          <span>© {new Date().getFullYear()} AI-Pass</span>
          <span>Intelligence Lab · Flow · Merit · Realms · Cortex · Scout · Robotics</span>
        </div>
      </footer>
    </div>
  );
}
