import type { Metadata } from 'next';
import { ResearchShell } from '../components/ResearchShell';
import { RiskMap, RoadmapGantt, StageGateFunnel } from '../components/visuals';
import { getArtifacts, statusLabel } from '../../lib/hopn-lab';
import styles from '../research.module.css';

export const metadata: Metadata = {
  title: 'HOPN Lab roadmap',
  description: 'Twelve-month research agenda, publication stage gates, and planned artifact releases.',
  alternates: { canonical: 'https://aipass.space/research/roadmap' },
};

export default function RoadmapPage() {
  return (
    <ResearchShell
      path="/research/roadmap"
      crumbs={[
        { href: '/research', label: 'HOPN Lab' },
        { href: '/research/roadmap', label: 'Roadmap' },
      ]}
    >
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Research agenda</p>
        <h1 className={styles.title}>Roadmap</h1>
        <p className={styles.lead}>
          Twelve months, grouped by program. Status comes from the lab data file. No journal names.
        </p>
      </header>
      <section className={styles.section}>
        <h2>Timeline</h2>
        <RoadmapGantt />
      </section>
      <section className={styles.section}>
        <h2>Publication stage gates</h2>
        <p className={styles.lead}>Scoping, logs, draft, internal review, then submission.</p>
        <StageGateFunnel />
      </section>
      <section className={styles.section}>
        <h2>Planned artifact releases</h2>
        <ul className={styles.list}>
          {getArtifacts().map((item) => (
            <li key={item.label}>
              {item.label} ({statusLabel(item.status)})
            </li>
          ))}
        </ul>
      </section>
      <section className={styles.section}>
        <h2>Qualitative risks</h2>
        <RiskMap />
      </section>
    </ResearchShell>
  );
}
