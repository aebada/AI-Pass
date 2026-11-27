import type { Metadata } from 'next';
import Link from 'next/link';
import { PremiumNav } from '../components/premium/PremiumNav';
import { MarketingThemeLock } from '../components/MarketingThemeLock';
import { BrandLogoLink } from '../components/BrandLogoLink';
import { FOOTER_COLUMNS } from '../lib/site-nav';
import homeStyles from '../page.module.css';
import styles from '../connect/page.module.css';

export const metadata: Metadata = {
  title: 'Lifecycle Intelligence | AI-Pass',
  description:
    'Full product lifecycle intelligence — concept to aftermarket. Ontology, knowledge graph, Requirements Manager, Explorer, Error Inspector, Ticket Analyzer.',
};

const PIPELINE = [
  {
    title: 'Ingest',
    copy: 'Connect Teamcenter, Windchill, 3DEXPERIENCE, SAP, test, and warehouses — no migration.',
  },
  {
    title: 'Map & trace',
    copy: 'Agentic mapping: deterministic rules, AI assist, engineer confirm. 100% provenance.',
  },
  {
    title: 'Resolve & version',
    copy: 'Deduplicate into one connected product dataset across variants and revisions.',
  },
  {
    title: 'Serve',
    copy: 'API and MCP so apps, agents, and analytics read the same product truth.',
  },
];

const ELEMENTS = [
  {
    title: 'Product ontology',
    copy: 'Requirements, software, hardware, production, and service in one governed schema.',
  },
  {
    title: 'Knowledge graph',
    copy: 'Queryable Engineering Intelligence Network with evidence paths to source systems.',
  },
  {
    title: 'Agentic data mapping',
    copy: 'Low-quality enterprise data in; confirmed mappings out — on-prem / air-gap ready.',
  },
  {
    title: 'AI Studio',
    copy: 'Configure ontologies, agents, and apps grounded in product twins — no code required.',
  },
];

const APPS = [
  {
    title: 'Requirements Manager',
    copy: 'Catch gaps and conflicts before they hit design — against years of linked data.',
  },
  {
    title: 'Product Explorer',
    copy: 'Ask natural-language questions across parts, tests, suppliers, and VINs.',
  },
  {
    title: 'Error Inspector',
    copy: 'Trace defects and warranty tickets to components and requirements in minutes.',
  },
  {
    title: 'Ticket Analyzer',
    copy: 'Summarize field tickets, propose fixes, and link them into the product twin.',
  },
  {
    title: 'Build Your Own Solution',
    copy: 'Configure ontologies, widgets, and agents on the same knowledge graph.',
  },
];

export default function LifecycleMarketingPage() {
  return (
    <div className={homeStyles.page}>
      <MarketingThemeLock />
      <PremiumNav variant="landing" />

      <main>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Lifecycle Intelligence</p>
          <h1>
            Scattered data becomes
            <span> one product representation.</span>
          </h1>
          <p className={styles.sub}>
            Build the ontology. Map sources with provenance. Resolve a knowledge graph. Serve it to
            every team and agent — without replacing your PLM.
          </p>
          <div className={styles.ctas}>
            <Link href="/workspace/lifecycle" className={homeStyles.btnPrimary}>
              Open Lifecycle workspace
            </Link>
            <Link href="/workspace/connect" className={homeStyles.btnSecondary}>
              Connect PLM systems
            </Link>
          </div>
        </section>

        <section className={styles.section}>
          <h2>From source to impact</h2>
          <div className={styles.capGrid}>
            {PIPELINE.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>Three platform elements</h2>
          <div className={styles.capGrid}>
            {ELEMENTS.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>Apps on the product twin</h2>
          <div className={styles.capGrid}>
            {APPS.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>How to use it</h2>
          <ol className={styles.howList}>
            <li>
              <strong>Connect</strong> — attach PLM/CAD/ERP via Connect (no rip-and-replace).
            </li>
            <li>
              <strong>Build ontology</strong> — start from the product pack; extend entity types.
            </li>
            <li>
              <strong>Map &amp; ingest</strong> — confirm AI suggestions; resolve into the graph.
            </li>
            <li>
              <strong>Explore</strong> — Requirements, Explorer, Inspector — answers with evidence.
            </li>
          </ol>
        </section>
      </main>

      <footer className={homeStyles.footer}>
        <div className={homeStyles.footerInner}>
          <div className={homeStyles.footerBrand}>
            <BrandLogoLink />
            <p className={homeStyles.footerTag}>
              Connect everything. Build the twin. Graph the product lifecycle.
            </p>
          </div>
          <div className={homeStyles.footerColumns}>
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <h4>{col.title}</h4>
                <ul>
                  {col.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link href={link.href}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
