import type { Metadata } from 'next';
import Link from 'next/link';
import { PremiumNav } from '../components/premium/PremiumNav';
import { MarketingThemeLock } from '../components/MarketingThemeLock';
import { BrandLogoLink } from '../components/BrandLogoLink';
import { HARNESS_LAYERS, HARNESS_SAFETY } from '../lib/company-harness';
import { FOOTER_COLUMNS } from '../lib/site-nav';
import homeStyles from '../page.module.css';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Company Harness | AI-Pass',
  description:
    'Model harness for companies: My AI-Pass router, event-driven agents, company as code, connectors, and governed outcomes — sovereign on your infrastructure.',
};

export default function CompanyOsPage() {
  return (
    <div className={homeStyles.page}>
      <MarketingThemeLock />
      <PremiumNav variant="landing" />
      <main>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Company harness</p>
          <h1>
            The operating system
            <span> for your company agents.</span>
          </h1>
          <p className={styles.sub}>
            Always-on agents that start on events, run in parallel, and share one memory of your
            company. Talk to My AI-Pass — it routes the work and never blocks.
          </p>
          <div className={styles.ctas}>
            <Link href="/workspace/company-harness" className={homeStyles.btnPrimary}>
              Open Company Harness
            </Link>
            <Link href="/workspace/connect" className={homeStyles.btnSecondary}>
              Connect tools first
            </Link>
          </div>
        </section>

        <section className={styles.section}>
          <h2>How to use it</h2>
          <ol className={styles.how}>
            <li>
              <strong>Message My AI-Pass</strong> — one place to talk; specialists run in the background.
            </li>
            <li>
              <strong>Turn on triggers</strong> — schedules, webhooks, and connectors start agents alone.
            </li>
            <li>
              <strong>Track outcomes</strong> — each goal has a definition of done and a verifier.
            </li>
          </ol>
        </section>

        <section className={styles.section}>
          <h2>What the harness includes</h2>
          <div className={styles.grid}>
            {HARNESS_LAYERS.map((layer) => (
              <article key={layer.title}>
                <h3>{layer.title}</h3>
                <p>{layer.copy}</p>
              </article>
            ))}
          </div>
          <div className={styles.ctas} style={{ marginTop: '1.5rem' }}>
            <Link href="/workspace/company-harness" className={homeStyles.btnPrimary}>
              Try it now
            </Link>
            <Link href="/graph-builder" className={homeStyles.btnSecondary}>
              Graph Builder
            </Link>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Runtime safety</h2>
          <p className={styles.sub} style={{ maxWidth: '40rem', marginBottom: '1.25rem' }}>
            Confirmation gates, twin context, role walls, and audit — so long-running agents stay
            governed in production.
          </p>
          <div className={styles.grid}>
            {HARNESS_SAFETY.map((item) => (
              <article key={item.id}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
          <div className={styles.ctas} style={{ marginTop: '1.5rem' }}>
            <Link href="/lab/cortex" className={homeStyles.btnSecondary}>
              Cortex evals
            </Link>
            <Link href="/lab" className={homeStyles.btnSecondary}>
              Intelligence Lab
            </Link>
          </div>
        </section>
      </main>
      <footer className={homeStyles.footer}>
        <div className={homeStyles.footerTop}>
          <BrandLogoLink />
          <p className={homeStyles.footerTag}>Company as code · Twin memory · Governed agents</p>
        </div>
        <div className={homeStyles.footerGrid}>
          {FOOTER_COLUMNS.slice(0, 4).map((column) => (
            <div key={column.title} className={homeStyles.footerCol}>
              <h3>{column.title}</h3>
              <ul>
                {column.links.slice(0, 5).map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
