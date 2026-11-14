import type { Metadata } from 'next';
import Link from 'next/link';
import { LabShell } from '../LabShell';
import { LAB_DEMO_MAILTO, LAB_DOMAINS, SCOUT_CAPABILITIES } from '../lab-data';
import styles from '../lab.module.css';

export const metadata: Metadata = {
  title: 'Experts | AI-Pass Intelligence Lab',
  description:
    'AI-Pass Experts with Scout AI recruiter: structured skill interviews, certification reuse, and domain specialist staffing.',
};

const OUTCOMES = [
  {
    title: 'AI-assisted sourcing',
    copy: 'Scout surfaces domain experts at high velocity across 100+ specialty fields.',
  },
  {
    title: 'Vetting that holds up',
    copy: 'Skills checks, sample tasks, and quality history before experts enter Flow queues.',
  },
  {
    title: 'Capacity on demand',
    copy: 'Scale labeling, review, and evaluation benches when Realms and Cortex spikes hit.',
  },
  {
    title: 'Same identity layer',
    copy: 'Experts work inside AI-Pass governance — roles, wallets, and audit — not a side portal.',
  },
];

export default function ExpertsPage() {
  return (
    <LabShell activeSlug="experts">
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <p className={styles.eyebrow}>Experts · Scout</p>
            <h1 className={styles.heroTitle}>
              Domain specialists for <span>net-new expert data</span>
            </h1>
            <p className={styles.heroSub}>
              Experts is the AI-Pass network. Scout — our AI recruiter — runs structured skill
              interviews, reuses certifications, and staffs Flow, Cortex, and Robotics.
            </p>
            <div className={styles.ctas}>
              <a href={LAB_DEMO_MAILTO} className={styles.btnPrimary}>
                Book Experts demo
              </a>
              <Link href="/lab/flow" className={styles.btnSecondary}>
                Send them to Flow
              </Link>
            </div>
          </div>
          <div className={styles.stage} aria-hidden>
            <div className={styles.stageChrome}>
              <span>Scout · interview</span>
              <span>Live</span>
            </div>
            <div className={styles.stageBody}>
              <div className={styles.metricRow}>
                <div className={styles.metric}>
                  <strong>180+</strong>
                  <span>Domains</span>
                </div>
                <div className={styles.metric}>
                  <strong>42</strong>
                  <span>Vetted today</span>
                </div>
                <div className={styles.metric}>
                  <strong>9.4</strong>
                  <span>Avg quality</span>
                </div>
              </div>
              <div className={styles.feed}>
                <div className={styles.feedItem}>
                  <span>Fast-track: skills already certified</span>
                  <em>skip</em>
                </div>
                <div className={styles.feedItem}>
                  <span>Partial interview: 2 skills remaining</span>
                  <em>live</em>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className={styles.section} aria-labelledby="scout-caps">
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>Scout</p>
          <h2 id="scout-caps">AI recruiter features</h2>
          <p className={styles.sectionSub}>
            Structured interviews, skill reuse, and recruiter review — first-party on AI-Pass.
          </p>
        </div>
        <div className={styles.outcomeGrid}>
          {SCOUT_CAPABILITIES.map((item) => (
            <article key={item.title} className={styles.outcome}>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
          {OUTCOMES.map((item) => (
            <article key={item.title} className={styles.outcome}>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
        <div className={styles.domainStrip} style={{ marginTop: 28 }}>
          {LAB_DOMAINS.map((domain) => (
            <span key={domain} className={styles.domainChip}>
              {domain}
            </span>
          ))}
        </div>
      </section>
    </LabShell>
  );
}
