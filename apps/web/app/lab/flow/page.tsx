import type { Metadata } from 'next';
import Link from 'next/link';
import { LabShell } from '../LabShell';
import { LAB_DEMO_MAILTO } from '../lab-data';
import styles from '../lab.module.css';

export const metadata: Metadata = {
  title: 'Flow | AI-Pass Intelligence Lab',
  description:
    'AI-Pass Flow: human-in-the-loop expert data production with live velocity, quality, cost, and error tracking.',
};

const OUTCOMES = [
  {
    title: 'Create & review at scale',
    copy: 'Domain experts author and review complex datasets in guided queues with clear acceptance criteria.',
  },
  {
    title: 'Measure the pipeline',
    copy: 'Track velocity, error rates, cost per task, and quality scores in real time — not weekly spreadsheets.',
  },
  {
    title: 'Industry datasets',
    copy: 'Healthcare, legal, finance, STEM, coding, vision, and audio packs that plug into Realms and Cortex.',
  },
  {
    title: 'Governed delivery',
    copy: 'Exports land in AI-Pass knowledge, twins, and training jobs with audit trails from Trust Engine.',
  },
];

export default function FlowPage() {
  return (
    <LabShell activeSlug="flow">
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <p className={styles.eyebrow}>Flow</p>
            <h1 className={styles.heroTitle}>
              Expert data production <span>with a live control room</span>
            </h1>
            <p className={styles.heroSub}>
              Flow is the AI-Pass environment where domain experts create, review, and deliver
              complex datasets — with performance tracking that keeps quality and cost visible.
            </p>
            <div className={styles.ctas}>
              <a href={LAB_DEMO_MAILTO} className={styles.btnPrimary}>
                Book Flow demo
              </a>
              <Link href="/lab/experts" className={styles.btnSecondary}>
                Staff with Experts
              </Link>
            </div>
          </div>
          <div className={styles.stage} aria-hidden>
            <div className={styles.stageChrome}>
              <span>Flow · Merit dashboard</span>
              <span>Live</span>
            </div>
            <div className={styles.stageBody}>
              <div className={styles.metricRow}>
                <div className={styles.metric}>
                  <strong>2.4h</strong>
                  <span>Median cycle</span>
                </div>
                <div className={styles.metric}>
                  <strong>0.7%</strong>
                  <span>Error rate</span>
                </div>
                <div className={styles.metric}>
                  <strong>$1.18</strong>
                  <span>Cost / task</span>
                </div>
              </div>
              <div className={styles.feed}>
                <div className={styles.feedItem}>
                  <span>Legal clause labeling</span>
                  <em>review</em>
                </div>
                <div className={styles.feedItem}>
                  <span>Coding preference pairs</span>
                  <em>ready</em>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className={styles.section} aria-labelledby="flow-outcomes">
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>Capabilities</p>
          <h2 id="flow-outcomes">Human-in-the-loop without losing the plot</h2>
          <p className={styles.sectionSub}>
            Production discipline for expert work: queues, rubrics, sampling, and delivery into the
            rest of AI-Pass.
          </p>
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
    </LabShell>
  );
}
