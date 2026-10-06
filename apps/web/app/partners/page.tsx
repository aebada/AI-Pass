import type { Metadata } from 'next';
import Link from 'next/link';
import { PremiumNav } from '../components/premium/PremiumNav';
import { BrandLogoLink } from '../components/BrandLogoLink';
import { FOOTER_COLUMNS } from '../lib/site-nav';
import styles from '../page.module.css';

export const metadata: Metadata = {
  title: 'Partners — collaborate with AI-Pass',
  description:
    'How AI-Pass partners with Micro1 and implementation firms: training gate plus deployment gate for regulated AI.',
};

const PATHS = [
  {
    title: 'Expert encode',
    copy: 'Micro1 experts sit with plant, quality, or risk owners. We turn that session into graph nodes, attributes, and rules.',
  },
  {
    title: 'Joint pilot',
    copy: 'One regulated workflow. Micro1 covers expert data. AI-Pass covers runtime, roles, and audit path.',
  },
  {
    title: 'Co-sell',
    copy: 'Shared accounts in manufacturing, banking, and public sector. One story: train with experts, deploy under rules.',
  },
];

export default function PartnersPage() {
  return (
    <div className={styles.page}>
      <PremiumNav variant="landing" />
      <main>
        <section className={styles.hero} aria-labelledby="partners-heading">
          <div className={styles.heroInner} style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
            <p className={styles.eyebrow}>Partnerships</p>
            <h1 id="partners-heading" className={styles.heroTitle}>
              Train with experts.
              <span className={styles.heroTitleAccent}> Deploy under rules.</span>
            </h1>
            <p className={styles.heroSub} style={{ marginLeft: 'auto', marginRight: 'auto' }}>
              Micro1 is the training gate. AI-Pass is the deployment gate. We collaborate so expert
              humans are not only used to train a model, but also encoded as the graph and policy
              that sit in front of it.
            </p>
            <div className={styles.heroCtas}>
              <a
                href="mailto:contact@aipass.space?subject=Micro1%20collaboration"
                className={styles.btnPrimary}
              >
                Start a Micro1 conversation
              </a>
              <Link href="/demo" className={styles.btnSecondary}>
                See the graph
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="how-collab">
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>How the collaboration works</p>
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

        <section className={styles.micro1} aria-labelledby="split-heading">
          <div className={styles.micro1Inner}>
            <h2 id="split-heading" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              Who does what
            </h2>
            <div className={styles.gateGrid}>
              <article className={styles.gateCard}>
                <p className={styles.gateKicker}>Micro1</p>
                <h3>Training gate</h3>
                <ul>
                  <li>Find and qualify domain experts</li>
                  <li>Build evaluation and training sets</li>
                  <li>Raise model quality before any agent ships</li>
                </ul>
              </article>
              <article className={styles.gateCardAccent}>
                <p className={styles.gateKicker}>Shared motion</p>
                <h3>One expert, two products</h3>
                <ul>
                  <li>The same human writes the rule once</li>
                  <li>Data goes to training. Rules go to the graph.</li>
                  <li>Customer gets a model and a governed runtime</li>
                </ul>
              </article>
              <article className={styles.gateCard}>
                <p className={styles.gateKicker}>AI-Pass</p>
                <h3>Deployment gate</h3>
                <ul>
                  <li>Knowledge graph, provenance, org rules</li>
                  <li>Role-based agents and audit hop paths</li>
                  <li>Private cloud and air-gapped packaging</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section className={styles.finalCta} aria-labelledby="partner-cta">
          <h2 id="partner-cta">Want to run a joint pilot?</h2>
          <p>Email partnerships. We will map one workflow, one expert desk, and one audit path.</p>
          <div className={styles.heroCtas}>
            <a
              href="mailto:contact@aipass.space?subject=Partnership%20pilot"
              className={styles.btnOnPurple}
            >
              Email contact@aipass.space
            </a>
            <Link href="/#book-demo" className={styles.btnGhostOnPurple}>
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
