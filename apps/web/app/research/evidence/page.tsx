import type { Metadata } from 'next';
import { ResearchShell } from '../components/ResearchShell';
import { EvidenceChecklist } from '../components/visuals';
import styles from '../research.module.css';

export const metadata: Metadata = {
  title: 'HOPN Lab evidence discipline',
  description: 'How HOPN Lab publishes: raw logs, pre-registration, disclosed relationships, and human adjudication.',
  alternates: { canonical: 'https://aipass.space/research/evidence' },
};

export default function EvidencePage() {
  return (
    <ResearchShell
      path="/research/evidence"
      crumbs={[
        { href: '/research', label: 'HOPN Lab' },
        { href: '/research/evidence', label: 'Evidence' },
      ]}
    >
      <header className={styles.hero}>
        <p className={styles.eyebrow}>How we publish</p>
        <h1 className={styles.title}>Evidence discipline</h1>
        <p className={styles.lead}>
          We treat papers as protocols plus logs. This page is the checklist, not a results board.
        </p>
      </header>
      <section className={styles.section}>
        <EvidenceChecklist />
      </section>
    </ResearchShell>
  );
}
