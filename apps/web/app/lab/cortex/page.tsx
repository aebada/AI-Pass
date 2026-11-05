import type { Metadata } from 'next';
import Link from 'next/link';
import { LabShell } from '../LabShell';
import { LAB_DEMO_MAILTO } from '../lab-data';
import styles from '../lab.module.css';

export const metadata: Metadata = {
  title: 'Cortex | AI-Pass Intelligence Lab',
  description:
    'AI-Pass Cortex: evaluate, diagnose, improve, and monitor AI agents with expert human judgment from real workflows.',
};

const STEPS = [
  {
    title: 'Evaluation design',
    copy: 'Define success criteria, rubrics, and scoring for each agent task before it ships.',
  },
  {
    title: 'Failure diagnosis',
    copy: 'Domain experts review outputs and pinpoint where, why, when, and how the agent fails.',
  },
  {
    title: 'Expert training data',
    copy: 'Produce targeted Flow datasets that attack the highest-priority failure modes.',
  },
  {
    title: 'Monitor reliability',
    copy: 'Re-evaluate as models, prompts, workflows, and rules change — keep a live reliability score.',
  },
];

const OUTCOMES = [
  {
    title: 'Faster time to production',
    copy: 'Find failure modes earlier and cut iteration cycles before customers feel them.',
  },
  {
    title: 'Clear performance visibility',
    copy: 'Always know why agents fail — and have a path to fix it with expert data.',
  },
  {
    title: 'Greater customer trust',
    copy: 'Consistency and accuracy in critical experiences, backed by Trust Engine evidence.',
  },
  {
    title: 'Continuous improvement',
    copy: 'Monitor as the agent and its operating environment evolve after launch.',
  },
];

export default function CortexPage() {
  return (
    <LabShell activeSlug="cortex">
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <p className={styles.eyebrow}>Cortex</p>
            <h1 className={styles.heroTitle}>
              The reliability layer for <span>agentic AI</span>
            </h1>
            <p className={styles.heroSub}>
              Cortex evaluates agents on real workflows with expert human judgment — diagnose
              failures, generate training data, and monitor reliability after launch.
            </p>
            <div className={styles.ctas}>
              <a href={LAB_DEMO_MAILTO} className={styles.btnPrimary}>
                Book Cortex demo
              </a>
              <Link href="/workspace/trust" className={styles.btnSecondary}>
                Open Trust Engine
              </Link>
            </div>
          </div>
          <div className={styles.stage} aria-hidden>
            <div className={styles.stageChrome}>
              <span>Cortex · reliability</span>
              <span>Monitoring</span>
            </div>
            <div className={styles.stageBody}>
              <div className={styles.metricRow}>
                <div className={styles.metric}>
                  <strong>94</strong>
                  <span>Reliability</span>
                </div>
                <div className={styles.metric}>
                  <strong>7</strong>
                  <span>Open clusters</span>
                </div>
                <div className={styles.metric}>
                  <strong>3</strong>
                  <span>Data fixes</span>
                </div>
              </div>
              <div className={styles.feed}>
                <div className={styles.feedItem}>
                  <span>Policy miss · refund path</span>
                  <em>diagnosed</em>
                </div>
                <div className={styles.feedItem}>
                  <span>Targeted Flow batch</span>
                  <em>queued</em>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className={styles.section} aria-labelledby="cortex-how">
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>How it works</p>
          <h2 id="cortex-how">Turn agent reliability into a measurable process</h2>
          <p className={styles.sectionSub}>
            Evaluate real workflows, diagnose failures, create targeted training data, and monitor
            performance continuously.
          </p>
        </div>
        <div className={styles.pipeline}>
          {STEPS.map((step) => (
            <article key={step.title} className={styles.step}>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.band} aria-labelledby="cortex-impact">
        <div className={styles.bandInner}>
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>Impact</p>
            <h2 id="cortex-impact">Reliability that shows up as business outcomes</h2>
          </div>
          <div className={styles.outcomeGrid}>
            {OUTCOMES.map((item) => (
              <article key={item.title} className={styles.outcome}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </LabShell>
  );
}
