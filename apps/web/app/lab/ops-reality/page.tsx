import type { Metadata } from 'next';
import Link from 'next/link';
import { LabShell } from '../LabShell';
import { LAB_DEMO_MAILTO } from '../lab-data';
import styles from '../lab.module.css';

export const metadata: Metadata = {
  title: 'Ops Reality | AI-Pass Intelligence Lab',
  description:
    'AI-Pass Ops Reality: company data partnerships that turn operational workflows into governed twin environments — you keep ownership.',
};

const STEPS = [
  {
    title: 'Discovery & pricing',
    copy: 'Identify Connect-able systems and licensable workflow patterns. Twin Starter from €8k; Ops Reality co-build from €25k.',
  },
  {
    title: 'Contracting',
    copy: 'Clear terms: you retain ownership; no resale of raw PII; anonymization before any realm pack leaves your tenancy.',
  },
  {
    title: 'Connect + twin',
    copy: 'Least-privilege connectors into 1–2 systems; employee/process twins with Graph Builder evidence rules.',
  },
  {
    title: 'Realm extraction',
    copy: 'Experts turn SOPs and ticket patterns into Realms for agent eval — optional white-label for your clients.',
  },
  {
    title: 'Harness gates',
    copy: 'Irreversible actions stay behind human confirmation. Audit hops land in Trust Engine.',
  },
  {
    title: 'Optional revenue share',
    copy: 'If anonymized realm packs are licensed to labs later, share economics by contract — never a silent dump.',
  },
];

export default function OpsRealityPage() {
  return (
    <LabShell activeSlug="ops-reality">
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <p className={styles.eyebrow}>Ops Reality</p>
            <h1 className={styles.heroTitle}>
              Company workflows as <span>twin environments</span>
            </h1>
            <p className={styles.heroSub}>
              Micro1-style company data partnerships — without selling raw CRM dumps. AI-Pass Connects
              systems, builds governed twins, and optionally co-creates anonymized Realms. You keep
              ownership.
            </p>
            <div className={styles.ctas}>
              <a href={LAB_DEMO_MAILTO} className={styles.btnPrimary}>
                Book Ops Reality pilot
              </a>
              <Link href="/connect" className={styles.btnSecondary}>
                See Connect
              </Link>
            </div>
          </div>
          <div className={styles.stage} aria-hidden>
            <div className={styles.stageChrome}>
              <span>Ops Reality · partnership</span>
              <span>EU-first</span>
            </div>
            <div className={styles.stageBody}>
              <div className={styles.feed}>
                <div className={styles.feedItem}>
                  <span>Connect ticket + project systems</span>
                  <em>step 1</em>
                </div>
                <div className={styles.feedItem}>
                  <span>Twin delivery roles</span>
                  <em>step 2</em>
                </div>
                <div className={styles.feedItem}>
                  <span>Anonymized Realms + Experts review</span>
                  <em>step 3</em>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className={styles.section} aria-labelledby="ops-steps">
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>Process</p>
          <h2 id="ops-steps">Partnership shape</h2>
          <p className={styles.sectionSub}>
            Same commercial rhythm as leading data-partnership programs — rebuilt for twin + harness
            infrastructure.
          </p>
        </div>
        <div className={styles.outcomeGrid}>
          {STEPS.map((s) => (
            <article key={s.title} className={styles.outcome}>
              <h3>{s.title}</h3>
              <p>{s.copy}</p>
            </article>
          ))}
        </div>
      </section>
    </LabShell>
  );
}
