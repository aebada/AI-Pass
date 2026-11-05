import type { Metadata } from 'next';
import Link from 'next/link';
import { LabShell } from '../LabShell';
import { LAB_DEMO_MAILTO, LAB_DOMAINS } from '../lab-data';
import styles from '../lab.module.css';

export const metadata: Metadata = {
  title: 'Experts | AI-Pass Intelligence Lab',
  description:
    'AI-Pass Experts: source and vet domain specialists for expert data production, reviews, and robotics labeling.',
};

const OUTCOMES = [
  {
    title: 'AI-assisted sourcing',
    copy: 'Recruitment agents surface domain experts at high velocity across 100+ specialty fields.',
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
            <p className={styles.eyebrow}>Experts</p>
            <h1 className={styles.heroTitle}>
              Domain specialists for <span>net-new expert data</span>
            </h1>
            <p className={styles.heroSub}>
              Experts is the AI-Pass network that sources and vets the humans behind Flow, Cortex,
              and Robotics — the foundation for data you cannot scrape.
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
              <span>Experts · recruiter</span>
              <span>Active</span>
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
                  <span>Oncology reviewer shortlist</span>
                  <em>ready</em>
                </div>
                <div className={styles.feedItem}>
                  <span>Robotics teleop annotators</span>
                  <em>sourcing</em>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className={styles.section} aria-labelledby="experts-outcomes">
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>Capabilities</p>
          <h2 id="experts-outcomes">Staff the human foundation of your lab</h2>
        </div>
        <div className={styles.outcomeGrid}>
          {OUTCOMES.map((item) => (
            <article key={item.title} className={styles.outcome}>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.band} aria-labelledby="experts-domains">
        <div className={styles.bandInner}>
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>Coverage</p>
            <h2 id="experts-domains">Specialists across the fields that matter</h2>
          </div>
          <div className={styles.domainStrip}>
            {LAB_DOMAINS.map((domain) => (
              <span key={domain} className={styles.domainChip}>
                {domain}
              </span>
            ))}
          </div>
        </div>
      </section>
    </LabShell>
  );
}
