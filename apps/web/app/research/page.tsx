import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactForm } from './components/ContactForm';
import { LabPlayground } from './components/LabPlayground';
import { ResearchShell } from './components/ResearchShell';
import { ProgramCards, ProjectMatrix, RoadmapGantt } from './components/visuals';
import { getLab, getWhy, LAB_CONTACT_MAILTO, LAB_EMAIL } from '../lib/hopn-lab';
import styles from './research.module.css';

const lab = getLab();

export const metadata: Metadata = {
  title: 'HOPN Lab: trustworthy AI under constraint',
  description:
    'HOPN Lab research agenda: Route, Ground, Assure, Foundation and Physical. Interactive diagrams, planned metrics, and a live demo. No claimed results.',
  alternates: { canonical: 'https://aipass.space/research' },
  openGraph: {
    title: 'HOPN Lab: trustworthy AI under constraint',
    description: lab.question,
    url: 'https://aipass.space/research',
  },
};

export default function ResearchLandingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ResearchOrganization',
    name: lab.name,
    parentOrganization: { '@type': 'Organization', name: lab.org },
    url: 'https://aipass.space/research',
    email: LAB_EMAIL,
    description: lab.intro,
  };

  return (
    <ResearchShell path="/research" crumbs={[{ href: '/research', label: 'HOPN Lab' }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className={styles.hero}>
        <p className={styles.eyebrow}>HOPN Lab · research agenda</p>
        <h1 className={styles.title}>{lab.headline}</h1>
        <p className={styles.question}>{lab.question}</p>
        <p className={styles.lead}>{lab.intro}</p>
        <p className={styles.note}>{lab.agendaNote}</p>
        <div className={styles.ctaRow}>
          <Link className={styles.btnPrimary} href="/demo">
            Try the interactive demo
          </Link>
          <a className={styles.btnSecondary} href={LAB_CONTACT_MAILTO}>
            Email {LAB_EMAIL}
          </a>
          <Link className={styles.btnGhost} href="#agenda">
            Read the agenda
          </Link>
        </div>
      </header>

      <section className={styles.section} aria-labelledby="why-heading">
        <h2 id="why-heading">Why this work</h2>
        <div className={styles.whyGrid}>
          {getWhy().map((item) => (
            <article className={styles.whyCard} key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <LabPlayground />

      <section className={styles.section} id="agenda" aria-labelledby="programs-heading">
        <h2 id="programs-heading">Five programs</h2>
        <p className={styles.lead}>Each page is one question, the planned work, and the metrics we will report later.</p>
        <ProgramCards />
      </section>

      <section className={styles.section} aria-labelledby="matrix-heading">
        <h2 id="matrix-heading">Projects mapped to programs</h2>
        <p className={styles.lead}>Public project names only. Physical-track hardware names stay private until positioning is set.</p>
        <ProjectMatrix />
      </section>

      <section className={styles.section} aria-labelledby="roadmap-heading">
        <h2 id="roadmap-heading">Twelve-month plan</h2>
        <RoadmapGantt compact />
        <p>
          <Link href="/research/roadmap">Full roadmap</Link>
          {' · '}
          <Link href="/research/evidence">How we publish</Link>
        </p>
      </section>

      <section className={styles.section} aria-labelledby="contact-heading">
        <h2 id="contact-heading">Talk to us</h2>
        <p className={styles.lead}>
          Buyers, students and funders: write a short note. We reply from {LAB_EMAIL}. Or open the live demo first.
        </p>
        <ContactForm />
      </section>
    </ResearchShell>
  );
}
