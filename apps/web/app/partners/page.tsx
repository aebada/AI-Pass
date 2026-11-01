import type { Metadata } from 'next';
import Link from 'next/link';
import { PremiumNav } from '../components/premium/PremiumNav';
import { BrandLogoLink } from '../components/BrandLogoLink';
import { MarketingThemeLock } from '../components/MarketingThemeLock';
import { FOOTER_COLUMNS } from '../lib/site-nav';
import styles from '../page.module.css';

export const metadata: Metadata = {
  title: 'Partners — collaborate with AI-Pass',
  description:
    'Partner with AI-Pass on digital twins, knowledge graphs, and governed agents for regulated enterprises.',
};

const PATHS = [
  {
    title: 'Implementation partners',
    copy: 'Bring industry workflows. We supply the twin, ontology, and agent runtime under organization rules.',
  },
  {
    title: 'Technology partners',
    copy: 'Connect CRM, ERP, MES, and data platforms so agents act with live context and an audit path.',
  },
  {
    title: 'Channel & co-sell',
    copy: 'Joint go-to-market in manufacturing, banking, healthcare, and public sector with one deployable story.',
  },
];

export default function PartnersPage() {
  return (
    <div className={styles.page}>
      <MarketingThemeLock />
      <PremiumNav variant="landing" />
      <main>
        <section className={styles.hero} aria-labelledby="partners-heading">
          <div className={styles.heroInner} style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
            <p className={styles.eyebrow}>Partnerships</p>
            <h1 id="partners-heading" className={styles.heroTitle}>
              Build twins together.
              <span className={styles.heroTitleAccent}> Deploy agents under rules.</span>
            </h1>
            <p className={styles.heroSub} style={{ marginLeft: 'auto', marginRight: 'auto' }}>
              AI-Pass builds expert capture, knowledge graphs, ontologies, and the deployment gate
              in one stack. Partner with us to connect apps, encode domain knowledge, and ship
              governed agents.
            </p>
            <div className={styles.heroCtas}>
              <a
                href="mailto:contact@aipass.space?subject=Partnership"
                className={styles.btnPrimary}
              >
                Talk to partnerships
              </a>
              <Link href="/demo" className={styles.btnSecondary}>
                See the graph
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="how-collab">
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>How we partner</p>
            <h2 id="how-collab">Three ways to work together</h2>
          </div>
          <div className={styles.pillarGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {PATHS.map((item) => (
              <article key={item.title} className={styles.pillar}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="stack-heading">
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>What we bring</p>
            <h2 id="stack-heading">Training quality and deployment in one product</h2>
            <p className={styles.sectionSub}>
              We encode human expertise, grow the ontology, and run agents with role walls — so
              partners do not need a separate training-gate vendor to go live.
            </p>
          </div>
          <div className={styles.gateGrid}>
            <article className={styles.gateCard}>
              <p className={styles.gateKicker}>Capture</p>
              <h3>Expert knowledge</h3>
              <ul>
                <li>Domain rules and SOPs</li>
                <li>Ontology and graph import</li>
                <li>Evaluation sets for twin quality</li>
              </ul>
            </article>
            <article className={styles.gateCardAccent}>
              <p className={styles.gateKicker}>Connect</p>
              <h3>Apps and interactions</h3>
              <ul>
                <li>CRM, ERP, MES, inbox, wallet</li>
                <li>Smart collector for live context</li>
                <li>Personal, business, robotics twins</li>
              </ul>
            </article>
            <article className={styles.gateCard}>
              <p className={styles.gateKicker}>Deploy</p>
              <h3>Governed agents</h3>
              <ul>
                <li>Knowledge graph and org rules</li>
                <li>Role-based agents and audit hops</li>
                <li>Cloud, private cloud, or air-gapped</li>
              </ul>
            </article>
          </div>
        </section>

        <section className={styles.finalCta} aria-labelledby="partner-cta">
          <h2 id="partner-cta">Want to run a joint pilot?</h2>
          <p>Email partnerships. We will map one workflow, one twin surface, and one audit path.</p>
          <div className={styles.heroCtas}>
            <a
              href="mailto:contact@aipass.space?subject=Partnership%20pilot"
              className={styles.btnOnPurple}
            >
              Email contact@aipass.space
            </a>
            <Link href="/book-demo" className={styles.btnGhostOnPurple}>
              Book a product demo
            </Link>
          </div>
        </section>
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <BrandLogoLink />
          <p className={styles.footerTag}>Enterprise AI infrastructure. Human expertise, applied.</p>
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
