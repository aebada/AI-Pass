import type { Metadata } from 'next';
import { ResearchShell } from '../components/ResearchShell';
import { RiskMap } from '../components/visuals';
import { showGovernance } from '../../lib/hopn-lab';
import styles from '../research.module.css';

export const metadata: Metadata = {
  title: 'HOPN Lab governance',
  description: 'Conflict of interest, dual-use and safety statement for HOPN Lab.',
  alternates: { canonical: 'https://aipass.space/research/governance' },
  robots: showGovernance() ? undefined : { index: false, follow: false },
};

export default function GovernancePage() {
  if (!showGovernance()) {
    return (
      <ResearchShell
        path="/research/governance"
        crumbs={[
          { href: '/research', label: 'HOPN Lab' },
          { href: '/research/governance', label: 'Governance' },
        ]}
      >
        <header className={styles.hero}>
          <h1 className={styles.title}>Governance statement</h1>
          <p className={styles.lead}>
            The public wording is under director review. Email contact@ehopn.com if you need the draft.
          </p>
        </header>
      </ResearchShell>
    );
  }

  return (
    <ResearchShell
      path="/research/governance"
      crumbs={[
        { href: '/research', label: 'HOPN Lab' },
        { href: '/research/governance', label: 'Governance' },
      ]}
    >
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Pending legal review when first enabled</p>
        <h1 className={styles.title}>Governance</h1>
      </header>
      <section className={styles.section}>
        <h2>Conflict of interest</h2>
        <p className={styles.lead}>
          HOPN Lab is the research arm of HOPN UG, a commercial company. Each study states its relationship to HOPN products and services.
        </p>
        <h2>Dual-use and safety</h2>
        <p className={styles.lead}>
          The lab does not build or publish offensive applications, weapon integration or targeting work. Physical trials follow written safety protocols, a named safety officer and incident logs.
        </p>
        <h2>Regulatory awareness</h2>
        <p className={styles.lead}>
          EU AI Act, drone regulation, machinery safety, and medical-device rules where relevant.
        </p>
        <h2>Risk map</h2>
        <RiskMap />
      </section>
    </ResearchShell>
  );
}
