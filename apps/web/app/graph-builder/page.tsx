import type { Metadata } from 'next';
import Link from 'next/link';
import { PremiumNav } from '../components/premium/PremiumNav';
import { MarketingThemeLock } from '../components/MarketingThemeLock';
import { BrandLogoLink } from '../components/BrandLogoLink';
import { PIPELINE_STAGES, SEATS } from '../lib/graph-builder';
import { FOOTER_COLUMNS } from '../lib/site-nav';
import homeStyles from '../page.module.css';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Graph Builder | AI-Pass',
  description:
    'Decision-model ontology and knowledge-graph builder. Approve a pack, judge every triple against evidence, then search with source sentences attached.',
};

export default function GraphBuilderMarketingPage() {
  return (
    <div className={homeStyles.page}>
      <MarketingThemeLock />
      <PremiumNav variant="landing" />
      <main>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Graph Builder</p>
          <h1>
            Ontology-first GraphRAG,
            <span> judged triple by triple.</span>
          </h1>
          <p className={styles.sub}>
            Approve the ontology first. A proposer suggests facts. A decision judge weighs each
            candidate against its evidence span. Only verified edges enter the graph.
          </p>
          <div className={styles.ctas}>
            <Link href="/workspace/graph-builder" className={homeStyles.btnPrimary}>
              Open Graph Builder
            </Link>
            <Link href="/company-os" className={homeStyles.btnSecondary}>
              Company Harness
            </Link>
          </div>
        </section>

        <section className={styles.section}>
          <h2>How to use it</h2>
          <ol className={styles.how}>
            <li>
              <strong>Approve a pack</strong> — legal, twin, open-domain, or bio-medical types.
            </li>
            <li>
              <strong>Build</strong> — paste documents; eight stages from ingest to verify.
            </li>
            <li>
              <strong>Ask</strong> — search returns facts with the source sentence attached.
            </li>
          </ol>
        </section>

        <section className={styles.section}>
          <h2>Seats</h2>
          <div className={styles.grid}>
            {SEATS.map((seat) => (
              <article key={seat.id}>
                <h3>{seat.name}</h3>
                <p>{seat.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>Pipeline</h2>
          <div className={styles.pills}>
            {PIPELINE_STAGES.map((s) => (
              <span key={s.id}>{s.label}</span>
            ))}
          </div>
          <div className={styles.ctas} style={{ marginTop: '1.5rem' }}>
            <Link href="/workspace/graph-builder" className={homeStyles.btnPrimary}>
              Build a judged graph
            </Link>
          </div>
        </section>
      </main>
      <footer className={homeStyles.footer}>
        <div className={homeStyles.footerTop}>
          <BrandLogoLink />
          <p className={homeStyles.footerTag}>Every fact gated and traceable to its evidence</p>
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
