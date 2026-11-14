import type { Metadata } from 'next';
import Link from 'next/link';
import { LabShell } from '../LabShell';
import { LAB_DEMO_MAILTO, REALM_TYPES } from '../lab-data';
import styles from '../lab.module.css';

export const metadata: Metadata = {
  title: 'Realms | AI-Pass Intelligence Lab',
  description:
    'AI-Pass Realms: frontier evaluations and RL environments for training and stress-testing agents on real work.',
};

const OUTCOMES = [
  {
    title: 'Frontier eval suites',
    copy: 'Scenario packs that mirror operational workflows — not synthetic leaderboard toys.',
  },
  {
    title: 'Custom RL environments',
    copy: 'Build training loops around your tools, policies, and twin state so agents learn the job.',
  },
  {
    title: 'Domain specialists',
    copy: 'Environments co-designed with experts across finance, medical, legal, coding, STEM, and more.',
  },
  {
    title: 'Twin-aware simulation',
    copy: 'Hook Realms into digital twins so agent actions land against living business and employee models.',
  },
];

export default function RealmsPage() {
  return (
    <LabShell activeSlug="realms">
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <p className={styles.eyebrow}>Realms</p>
            <h1 className={styles.heroTitle}>
              RL environments for <span>ambitious AI labs</span>
            </h1>
            <p className={styles.heroSub}>
              Realms is the AI-Pass data and evaluation engine for frontier training — environments
              that measure whether agents can do the work your enterprise actually needs.
            </p>
            <div className={styles.ctas}>
              <a href={LAB_DEMO_MAILTO} className={styles.btnPrimary}>
                Book Realms demo
              </a>
              <Link href="/lab/cortex" className={styles.btnSecondary}>
                Pair with Cortex
              </Link>
            </div>
          </div>
          <div className={styles.stage} aria-hidden>
            <div className={styles.stageChrome}>
              <span>Realms · frontier run</span>
              <span>12 envs</span>
            </div>
            <div className={styles.stageBody}>
              <div className={styles.metricRow}>
                <div className={styles.metric}>
                  <strong>0.81</strong>
                  <span>Success rate</span>
                </div>
                <div className={styles.metric}>
                  <strong>36</strong>
                  <span>Scenarios</span>
                </div>
                <div className={styles.metric}>
                  <strong>RL</strong>
                  <span>Loop active</span>
                </div>
              </div>
              <div className={styles.feed}>
                <div className={styles.feedItem}>
                  <span>Procurement twin stress test</span>
                  <em>pass</em>
                </div>
                <div className={styles.feedItem}>
                  <span>Claims adjudication realm</span>
                  <em>training</em>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className={styles.section} aria-labelledby="realms-outcomes">
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>Capabilities</p>
          <h2 id="realms-outcomes">Train where the work lives</h2>
          <p className={styles.sectionSub}>
            Environments, evaluations, and twin hooks that keep research progress tied to production
            reality.
          </p>
        </div>
        <div className={styles.outcomeGrid}>
          {OUTCOMES.map((item) => (
            <article key={item.title} className={styles.outcome}>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
          {REALM_TYPES.map((item) => (
            <article key={item.name} className={styles.outcome}>
              <h3>{item.name} Realm</h3>
              <p>Evidence: {item.evidence}. Same expert review loop across environments.</p>
            </article>
          ))}
        </div>
      </section>
    </LabShell>
  );
}
