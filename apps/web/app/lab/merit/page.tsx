import type { Metadata } from 'next';
import Link from 'next/link';
import { LabShell } from '../LabShell';
import { LAB_DEMO_MAILTO, MERIT_METRICS } from '../lab-data';
import styles from '../lab.module.css';

export const metadata: Metadata = {
  title: 'Merit | AI-Pass Intelligence Lab',
  description:
    'AI-Pass Merit: live dashboard for expert data quality, velocity, reliability, error rates, and cost per task.',
};

export default function MeritPage() {
  return (
    <LabShell activeSlug="merit">
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <p className={styles.eyebrow}>Merit</p>
            <h1 className={styles.heroTitle}>
              Pipeline performance <span>you can operate</span>
            </h1>
            <p className={styles.heroSub}>
              Merit is the AI-Pass control room for Flow and Realms — quality, velocity, reliability,
              error rates, and cost per task in real time, not weekly spreadsheets.
            </p>
            <div className={styles.ctas}>
              <a href={LAB_DEMO_MAILTO} className={styles.btnPrimary}>
                Book Merit demo
              </a>
              <Link href="/lab/flow" className={styles.btnSecondary}>
                Open Flow
              </Link>
            </div>
          </div>
          <div className={styles.stage} aria-hidden>
            <div className={styles.stageChrome}>
              <span>Merit · live</span>
              <span>All queues</span>
            </div>
            <div className={styles.stageBody}>
              <div className={styles.metricRow}>
                {MERIT_METRICS.slice(0, 3).map((m) => (
                  <div key={m.label} className={styles.metric}>
                    <strong>{m.value}</strong>
                    <span>{m.label}</span>
                  </div>
                ))}
              </div>
              <div className={styles.feed}>
                {MERIT_METRICS.slice(3).map((m) => (
                  <div key={m.label} className={styles.feedItem}>
                    <span>
                      {m.label}: {m.value}
                    </span>
                    <em>live</em>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className={styles.section} aria-labelledby="merit-metrics">
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>Meters</p>
          <h2 id="merit-metrics">What production teams watch</h2>
          <p className={styles.sectionSub}>
            Same signals micro1-style Merit dashboards expose — implemented first-party on AI-Pass.
          </p>
        </div>
        <div className={styles.outcomeGrid}>
          {MERIT_METRICS.map((m) => (
            <article key={m.label} className={styles.outcome}>
              <h3>
                {m.label} · {m.value}
              </h3>
              <p>{m.hint}</p>
            </article>
          ))}
        </div>
      </section>
    </LabShell>
  );
}
