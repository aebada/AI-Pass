import type { Metadata } from 'next';
import Link from 'next/link';
import { LabShell } from './LabShell';
import {
  LAB_DEMO_MAILTO,
  LAB_DOMAINS,
  LAB_PIPELINE,
  LAB_PRODUCTS,
} from './lab-data';
import styles from './lab.module.css';

export const metadata: Metadata = {
  title: 'Intelligence Lab | AI-Pass',
  description:
    'AI-Pass Intelligence Lab: expert human data, Flow production, Realms RL environments, Cortex agent evaluation, Experts network, and Robotics data — first-party infrastructure.',
};

export default function IntelligenceLabPage() {
  return (
    <LabShell>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <p className={styles.brandMark}>AI-Pass</p>
            <p className={styles.eyebrow}>Intelligence Lab</p>
            <h1 className={styles.heroTitle}>
              Expert data that makes agents <span>actually reliable</span>
            </h1>
            <p className={styles.heroSub}>
              Produce expert datasets, run frontier evaluations, diagnose agent failures, and staff
              domain specialists — one first-party lab inside AI-Pass, wired to twins, apps, and
              Trust Engine.
            </p>
            <div className={styles.ctas}>
              <a href={LAB_DEMO_MAILTO} className={styles.btnPrimary}>
                Book lab demo
              </a>
              <Link href="/lab/cortex" className={styles.btnSecondary}>
                See Cortex
              </Link>
            </div>
          </div>
          <div className={styles.stage} aria-hidden>
            <div className={styles.stageChrome}>
              <span>Lab live</span>
              <span>Pipeline health</span>
            </div>
            <div className={styles.stageBody}>
              <div className={styles.metricRow}>
                <div className={styles.metric}>
                  <strong>98.2%</strong>
                  <span>Expert quality</span>
                </div>
                <div className={styles.metric}>
                  <strong>4.1k</strong>
                  <span>Tasks / day</span>
                </div>
                <div className={styles.metric}>
                  <strong>12</strong>
                  <span>Active realms</span>
                </div>
              </div>
              <div className={styles.feed}>
                <div className={styles.feedItem}>
                  <span>Flow · medical rubric batch</span>
                  <em>shipped</em>
                </div>
                <div className={styles.feedItem}>
                  <span>Cortex · agent failure cluster</span>
                  <em>diagnosed</em>
                </div>
                <div className={styles.feedItem}>
                  <span>Realms · finance RL env</span>
                  <em>running</em>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className={styles.section} aria-labelledby="products-heading">
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>Product suite</p>
          <h2 id="products-heading">Everything an AI lab needs in one stack</h2>
          <p className={styles.sectionSub}>
            Flow, Realms, Cortex, Experts, and Robotics — owned capabilities on AI-Pass, not a
            third-party partnership badge.
          </p>
        </div>
        <div className={styles.productGrid}>
          {LAB_PRODUCTS.map((product) => (
            <Link key={product.slug} href={product.href} className={styles.productCard}>
              <p className={styles.eyebrow}>{product.eyebrow}</p>
              <h3>{product.name}</h3>
              <p>{product.tagline}</p>
              <span className={styles.cta}>Explore {product.name} →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.band} aria-labelledby="domains-heading">
        <div className={styles.bandInner}>
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>Domains</p>
            <h2 id="domains-heading">Expert coverage across real industries</h2>
            <p className={styles.sectionSub}>
              Specialists and evaluation environments spanning the fields where enterprise agents
              actually operate.
            </p>
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

      <section className={styles.section} aria-labelledby="pipeline-heading">
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>How it works</p>
          <h2 id="pipeline-heading">From rubric to reliable production agents</h2>
          <p className={styles.sectionSub}>
            A closed loop: define success, produce expert data, train and evaluate, then monitor as
            the system evolves.
          </p>
        </div>
        <div className={styles.pipeline}>
          {LAB_PIPELINE.map((step) => (
            <article key={step.title} className={styles.step}>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          ))}
        </div>
      </section>
    </LabShell>
  );
}
