import type { Metadata } from 'next';
import Link from 'next/link';
import { LabShell } from '../LabShell';
import { LAB_DEMO_MAILTO } from '../lab-data';
import styles from '../lab.module.css';

export const metadata: Metadata = {
  title: 'Robotics | AI-Pass Intelligence Lab',
  description:
    'AI-Pass Robotics: capture, annotate, and replay embodied training data alongside digital twins.',
};

const OUTCOMES = [
  {
    title: 'Episode capture',
    copy: 'Ingest teleop and autonomous runs with sensors, video, and control traces into the lab.',
  },
  {
    title: 'Expert annotation',
    copy: 'Flow-style review for physical tasks — success labels, failure modes, and preference data.',
  },
  {
    title: 'Sim-to-real loops',
    copy: 'Replay episodes against twins and Realms environments before hardware redeploy.',
  },
  {
    title: 'Cortex for robots',
    copy: 'Score embodied agents with the same reliability process used for software agents.',
  },
];

export default function RoboticsPage() {
  return (
    <LabShell activeSlug="robotics">
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <p className={styles.eyebrow}>Robotics</p>
            <h1 className={styles.heroTitle}>
              Embodied training data <span>on the same lab stack</span>
            </h1>
            <p className={styles.heroSub}>
              Robotics extends AI-Pass Intelligence Lab into the physical world — capture, annotate,
              and improve robot policies with expert judgment and twin feedback.
            </p>
            <div className={styles.ctas}>
              <a href={LAB_DEMO_MAILTO} className={styles.btnPrimary}>
                Book Robotics demo
              </a>
              <Link href="/lab/realms" className={styles.btnSecondary}>
                Explore Realms
              </Link>
            </div>
          </div>
          <div className={styles.stage} aria-hidden>
            <div className={styles.stageChrome}>
              <span>Robotics · twin loop</span>
              <span>Capture</span>
            </div>
            <div className={styles.stageBody}>
              <div className={styles.metricRow}>
                <div className={styles.metric}>
                  <strong>1.2k</strong>
                  <span>Episodes</span>
                </div>
                <div className={styles.metric}>
                  <strong>88%</strong>
                  <span>Annot. coverage</span>
                </div>
                <div className={styles.metric}>
                  <strong>Sim</strong>
                  <span>Replay OK</span>
                </div>
              </div>
              <div className={styles.feed}>
                <div className={styles.feedItem}>
                  <span>Pick-and-place failure cluster</span>
                  <em>labeled</em>
                </div>
                <div className={styles.feedItem}>
                  <span>Warehouse twin replay</span>
                  <em>queued</em>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className={styles.section} aria-labelledby="robotics-outcomes">
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>Capabilities</p>
          <h2 id="robotics-outcomes">Physical AI without a separate data silo</h2>
          <p className={styles.sectionSub}>
            Same Experts, Flow, Realms, and Cortex primitives — extended for hardware and twins.
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
