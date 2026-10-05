import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ResearchShell } from '../components/ResearchShell';
import {
  FrontierSchematic,
  MetricCards,
  QualityCascade,
  RoutingDiagram,
  StackMapping,
  TestbedLadder,
} from '../components/visuals';
import { KnowledgeGraphVisual } from '../components/visuals';
import { PROGRAM_ORDER, adjacentProgram, getProgram, getPrograms } from '../../lib/hopn-lab';
import styles from '../research.module.css';

export function generateStaticParams() {
  return PROGRAM_ORDER.map((program) => ({ program }));
}

export async function generateMetadata({ params }: { params: Promise<{ program: string }> }): Promise<Metadata> {
  const { program: id } = await params;
  const program = getProgram(id);
  if (!program) return { title: 'HOPN Lab' };
  return {
    title: `${program.name}: ${program.direction}`,
    description: program.question,
    alternates: { canonical: `https://aipass.space/research/${program.id}` },
  };
}

export default async function ProgramPage({ params }: { params: Promise<{ program: string }> }) {
  const { program: id } = await params;
  const program = getProgram(id);
  if (!program) notFound();
  const { prev, next } = adjacentProgram(program.id);
  const others = getPrograms().filter((p) => p.id !== program.id);

  return (
    <ResearchShell
      path={`/research/${program.id}`}
      crumbs={[
        { href: '/research', label: 'HOPN Lab' },
        { href: `/research/${program.id}`, label: program.name },
      ]}
    >
      <header className={styles.hero}>
        <p className={styles.eyebrow}>
          Track {program.track} · research agenda
        </p>
        <h1 className={styles.title}>{program.name}</h1>
        <p className={styles.question}>{program.question}</p>
        <p className={styles.lead}>{program.why}</p>
        <div className={styles.ctaRow}>
          <Link className={styles.btnPrimary} href="/demo">
            Try the interactive demo
          </Link>
          <Link className={styles.btnSecondary} href="/research">
            Back to overview
          </Link>
        </div>
      </header>

      <section className={styles.section}>
        <h2>Directions</h2>
        <ol className={styles.list}>
          {program.directions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <section className={styles.section}>
        <h2>Picture</h2>
        {program.id === 'route' ? <RoutingDiagram /> : null}
        {program.id === 'ground' ? <KnowledgeGraphVisual /> : null}
        {program.id === 'assure' ? <QualityCascade /> : null}
        {program.id === 'foundation' ? <FrontierSchematic /> : null}
        {program.id === 'physical' ? (
          <>
            <TestbedLadder />
            <h3>Digital versus physical</h3>
            <StackMapping />
          </>
        ) : null}
      </section>

      <section className={styles.section}>
        <h2>Planned metrics</h2>
        <p className={styles.lead}>Values stay Pending until we publish logs.</p>
        <MetricCards programId={program.id} />
      </section>

      <section className={styles.section}>
        <h2>Connects to</h2>
        <p>
          {others.map((item, i) => (
            <span key={item.id}>
              {i > 0 ? ' · ' : null}
              <Link href={`/research/${item.id}`}>{item.name}</Link>
            </span>
          ))}
        </p>
      </section>

      <nav className={styles.pager} aria-label="Program pages">
        {prev ? <Link href={`/research/${prev.id}`}>Previous: {prev.name}</Link> : <span />}
        {next ? <Link href={`/research/${next.id}`}>Next: {next.name}</Link> : <span />}
      </nav>
    </ResearchShell>
  );
}
