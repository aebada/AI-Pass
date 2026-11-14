import type { Metadata } from 'next';
import Link from 'next/link';
import { PremiumNav } from '../components/premium/PremiumNav';
import { MarketingThemeLock } from '../components/MarketingThemeLock';
import { BrandLogoLink } from '../components/BrandLogoLink';
import { CONNECT_CAPABILITIES, CONNECT_CATALOG } from '../lib/connect-catalog';
import { FOOTER_COLUMNS } from '../lib/site-nav';
import homeStyles from '../page.module.css';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Connect Platform | AI-Pass',
  description:
    'Connect your APIs, ERP, CRM, and apps to AI-Pass in three steps. Build the digital twin, then use agents on real company context.',
};

const PREVIEW = CONNECT_CATALOG.filter((c) =>
  ['sap', 'salesforce', 'sharepoint', 'custom-rest', 'webhooks-in', 'postgres'].includes(c.id),
);

export default function ConnectMarketingPage() {
  return (
    <div className={homeStyles.page}>
      <MarketingThemeLock />
      <PremiumNav variant="landing" />

      <main>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Connect platform</p>
          <h1>
            Connect your systems.
            <span> Use AI-Pass in minutes.</span>
          </h1>
          <p className={styles.sub}>
            No complex project to start. Pick a connector or paste your API URL. We sync into your
            digital twin. Agents and solutions work on that twin right away.
          </p>
          <div className={styles.ctas}>
            <Link href="/workspace/connect" className={homeStyles.btnPrimary}>
              Open Connect
            </Link>
            <Link href="/login" className={homeStyles.btnSecondary}>
              Sign in first
            </Link>
          </div>
        </section>

        <section className={styles.section}>
          <h2>How to use it</h2>
          <ol className={styles.howList}>
            <li>
              <strong>Connect</strong> — choose SAP, Salesforce, SharePoint, or add your REST API.
            </li>
            <li>
              <strong>Sync</strong> — data lands in your twin (people, apps, records) under your rules.
            </li>
            <li>
              <strong>Use</strong> — open Playground or a solution. Context is already there.
            </li>
          </ol>
        </section>

        <section className={styles.section}>
          <h2>What you can connect</h2>
          <div className={styles.capGrid}>
            {CONNECT_CAPABILITIES.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>Popular starters</h2>
          <div className={styles.starterGrid}>
            {PREVIEW.map((item) => (
              <article key={item.id}>
                <h3>{item.name}</h3>
                <p>{item.summary}</p>
              </article>
            ))}
          </div>
          <div className={styles.ctas} style={{ marginTop: '1.5rem' }}>
            <Link href="/workspace/connect" className={homeStyles.btnPrimary}>
              Start connecting
            </Link>
            <Link href="/#autopilot" className={homeStyles.btnSecondary}>
              See twin autopilot
            </Link>
          </div>
        </section>
      </main>

      <footer className={homeStyles.footer}>
        <div className={homeStyles.footerTop}>
          <BrandLogoLink />
          <p className={homeStyles.footerTag}>Connect everything. Build the twin. Let agents act.</p>
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
