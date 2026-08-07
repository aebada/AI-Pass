import Link from 'next/link';
import type { ReactNode } from 'react';
import { PremiumNav } from './premium/PremiumNav';
import { BrandLogoLink } from './BrandLogoLink';
import { DEMO_MAILTO, FOOTER_COLUMNS } from '../lib/site-nav';
import styles from '../page.module.css';
import section from '../home-sections.module.css';

export type MarketingSection = {
  title: string;
  body: string;
  items?: string[];
};

type MarketingPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
  sections?: MarketingSection[];
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

export function MarketingPage({
  eyebrow,
  title,
  description,
  children,
  sections,
  primaryCta = { label: 'Book Enterprise Demo', href: DEMO_MAILTO },
  secondaryCta = { label: 'Start Free', href: '/login' },
}: MarketingPageProps) {
  return (
    <div className={styles.page}>
      <PremiumNav variant="landing" />
      <section className={`${section.section} reveal`} aria-labelledby="marketing-heading">
        <div className={section.containerNarrow}>
          <p className={section.sectionLabel}>{eyebrow}</p>
          <h1 id="marketing-heading" className={section.sectionTitle}>
            {title}
          </h1>
          <p className={section.sectionDesc}>{description}</p>
          <div className={styles.heroCtas} style={{ marginTop: 28 }}>
            {primaryCta.href.startsWith('mailto:') ? (
              <a href={primaryCta.href} className={`${styles.btnPrimary} ${styles.btnLarge}`}>
                {primaryCta.label}
              </a>
            ) : (
              <Link href={primaryCta.href} className={`${styles.btnPrimary} ${styles.btnLarge}`}>
                {primaryCta.label}
              </Link>
            )}
            {secondaryCta.href.startsWith('mailto:') ? (
              <a href={secondaryCta.href} className={`${styles.btnSecondary} ${styles.btnLarge}`}>
                {secondaryCta.label}
              </a>
            ) : (
              <Link href={secondaryCta.href} className={`${styles.btnSecondary} ${styles.btnLarge}`}>
                {secondaryCta.label}
              </Link>
            )}
          </div>
        </div>
        {sections && sections.length > 0 ? (
          <div className={section.containerNarrow} style={{ marginTop: 64 }}>
            {sections.map((s) => (
              <article key={s.title} className="reveal" style={{ marginBottom: 48 }}>
                <h2 className={section.sectionTitle} style={{ fontSize: '1.5rem' }}>
                  {s.title}
                </h2>
                <p className={section.sectionDesc}>{s.body}</p>
                {s.items && s.items.length > 0 ? (
                  <ul style={{ marginTop: 16, paddingLeft: 18, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                    {s.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}
        {children ? <div style={{ maxWidth: 960, margin: '48px auto 0', padding: '0 24px' }}>{children}</div> : null}
      </section>
      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <BrandLogoLink className={styles.logo} logoClassName={styles.logoImg} />
          <p className={styles.footerTag}>Enterprise AI Infrastructure Platform</p>
        </div>
        <div className={styles.footerGrid}>
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title} className={styles.footerCol}>
              <h3>{col.title}</h3>
              <ul>
                {col.links.map((link) => (
                  <li key={`${col.title}-${link.label}`}>
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
        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} AI-Pass</span>
        </div>
      </footer>
    </div>
  );
}
