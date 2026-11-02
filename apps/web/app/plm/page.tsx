import type { Metadata } from 'next';
import Link from 'next/link';
import { PremiumNav } from '../components/premium/PremiumNav';
import { BrandLogoLink } from '../components/BrandLogoLink';
import { MarketingThemeLock } from '../components/MarketingThemeLock';
import { FOOTER_COLUMNS } from '../lib/site-nav';
import styles from '../page.module.css';

export const metadata: Metadata = {
  title: 'Product Lifecycle Management (PLM) — AI-Pass',
  description:
    'AI-Pass PLM connects BOM, change orders, quality, and production into a digital twin so agents can plan, approve, and act with an audit path.',
};

const STAGES = [
  { title: 'Concept', copy: 'Capture requirements, variants, and early design intent in the product twin.' },
  { title: 'Design', copy: 'Link CAD, BOM lines, and suppliers with role walls for engineering and sourcing.' },
  { title: 'Validate', copy: 'Run change impact analysis across parts, processes, and compliance rules.' },
  { title: 'Produce', copy: 'Push released revisions to MES and quality with explainable hop paths.' },
  { title: 'Service', copy: 'Keep as-maintained configuration in sync for field actions and renewals.' },
  { title: 'Retire', copy: 'Archive provenance, certificates, and decisions for audit and reuse.' },
];

const CAPABILITIES = [
  {
    title: 'BOM & product structure',
    copy: 'Multi-level BOM, alternates, and effectivity dates live as graph nodes agents can traverse.',
  },
  {
    title: 'Engineering change (ECO/ECN)',
    copy: 'Plan, blast-radius, and confirmation gates for every change — before production moves.',
  },
  {
    title: 'Quality & compliance',
    copy: 'Link lots, CAPA, and policy rules so quality answers stay deterministic and role-based.',
  },
  {
    title: 'Supplier & cost context',
    copy: 'Connect sourcing, lead times, and cost signals into the same twin as design data.',
  },
];

export default function PlmPage() {
  return (
    <div className={styles.page}>
      <MarketingThemeLock />
      <PremiumNav variant="landing" />
      <main>
        <section className={styles.hero} aria-labelledby="plm-heading">
          <div className={styles.heroGlow} aria-hidden />
          <div className={styles.heroInner}>
            <p className={styles.brandMark}>AI-Pass</p>
            <p className={styles.eyebrow}>Product Lifecycle Management</p>
            <h1 id="plm-heading" className={styles.heroTitle}>
              PLM inside the digital twin.
              <span className={styles.heroTitleAccent}> From concept to service.</span>
            </h1>
            <p className={styles.heroSub}>
              Connect product structure, change orders, quality, and production so agents can plan,
              approve, and act — with an audit path on every revision.
            </p>
            <div className={styles.heroCtas}>
              <Link href="/waitlist" className={styles.btnPrimary}>
                Join the waiting list
              </Link>
              <Link href="/book-demo" className={styles.btnSecondary}>
                Book a PLM demo
              </Link>
            </div>
          </div>
          <div className={styles.heroVisual}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.heroPhoto}
              src="/marketing/plm-lifecycle.jpg"
              alt="Engineers reviewing a product assembly across the lifecycle"
              width={1600}
              height={900}
            />
          </div>
        </section>

        <section className={styles.section} aria-labelledby="stages-heading">
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>Lifecycle</p>
            <h2 id="stages-heading">One twin across every PLM stage</h2>
            <p className={styles.sectionSub}>
              Concept, design, validate, produce, service, and retire share the same ontology,
              employees, and confirmation gates.
            </p>
          </div>
          <div className={styles.actionGrid}>
            {STAGES.map((stage) => (
              <article key={stage.title} className={styles.actionCard}>
                <h3>{stage.title}</h3>
                <p>{stage.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="cap-heading">
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>Capabilities</p>
            <h2 id="cap-heading">PLM that agents can actually run</h2>
            <p className={styles.sectionSub}>
              Not another document vault. Structure, change, and quality become actionable context
              for sales, planning, payments, and ops.
            </p>
          </div>
          <div className={styles.actionGrid}>
            {CAPABILITIES.map((item) => (
              <article key={item.title} className={styles.actionCard}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
          <div className={styles.heroCtas} style={{ justifyContent: 'center', marginTop: '1.75rem' }}>
            <Link href="/demo" className={styles.btnPrimary}>
              Open knowledge graph
            </Link>
            <Link href="/workspace/knowledge/ontology" className={styles.btnSecondary}>
              Open ontology studio
            </Link>
          </div>
        </section>

        <section className={styles.finalCta} aria-labelledby="plm-cta">
          <h2 id="plm-cta">Ready to run PLM under your rules?</h2>
          <p>Join the waiting list or book a demo of the product twin and change gates.</p>
          <div className={styles.heroCtas}>
            <Link href="/waitlist" className={styles.btnOnPurple}>
              Join the waiting list
            </Link>
            <Link href="/book-demo" className={styles.btnGhostOnPurple}>
              Book a demo
            </Link>
          </div>
        </section>
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <BrandLogoLink />
          <p className={styles.footerTag}>PLM, twins, and governed agents in one stack.</p>
        </div>
        <div className={styles.footerGrid}>
          {FOOTER_COLUMNS.slice(0, 4).map((column) => (
            <div key={column.title} className={styles.footerCol}>
              <h3>{column.title}</h3>
              <ul>
                {column.links.slice(0, 5).map((link) => (
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
      </footer>
    </div>
  );
}
