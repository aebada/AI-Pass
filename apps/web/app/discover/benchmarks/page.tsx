import type { Metadata } from 'next';
import Link from 'next/link';
import { getDiscoveryHub } from '@/src/lib/discovery-server';
import styles from '../discover.module.css';

export const metadata: Metadata = {
  title: 'AI Benchmarks | AI Pass Discovery Hub',
  description: 'Independent evaluations for reasoning, coding, RAG, vision, latency, cost efficiency, and tool calling.',
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function BenchmarksPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const hub = getDiscoveryHub();
  const toolId = first(sp.tool);

  if (toolId) {
    const tool = hub.discovery.getTool(toolId);
    if (!tool) return <p className={styles.heroSub}>Tool not found.</p>;
    const latest = hub.benchmarks.ensure(tool);
    const history = hub.benchmarks.getHistory(tool.id);

    return (
      <>
        <p className={styles.eyebrow}>Benchmarks</p>
        <h1 className={styles.heroTitle}>{tool.name}</h1>
        <p className={styles.heroSub}>Overall {latest.overall}/100 · history of independent evaluations over time.</p>
        <ul className={styles.cardMeta}>
          {latest.metrics.map((m) => (
            <li key={m.key}>{m.label}: {m.score}{m.unit ? ` (${m.unit})` : ''}</li>
          ))}
        </ul>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>History</h2>
          {history.map((h) => (
            <p key={h.measuredAt} className={styles.cardMeta}>
              {h.measuredAt.slice(0, 10)} — overall {h.overall}
            </p>
          ))}
        </section>
        <Link href={`/workspace/playground?models=${tool.modelsUsed[0] ?? tool.slug}`} className={styles.btnPrimary}>
          Test in Playground
        </Link>
      </>
    );
  }

  const leaderboard = hub.discovery
    .listTools()
    .map((t) => ({ tool: t, benchmark: hub.benchmarks.ensure(t) }))
    .sort((a, b) => b.benchmark.overall - a.benchmark.overall)
    .slice(0, 20);

  return (
    <>
      <h1 className={styles.heroTitle}>AI Benchmarks</h1>
      <p className={styles.heroSub}>
        Reasoning, coding, mathematics, translation, RAG, vision, long context, cost efficiency, latency, and tool calling.
      </p>
      <div className={styles.grid}>
        {leaderboard.map(({ tool, benchmark }, i) => (
          <article key={tool.id} className={styles.card}>
            <p className={styles.eyebrow}>#{i + 1}</p>
            <h3 className={styles.cardTitle}>
              <Link href={`/discover/benchmarks?tool=${tool.slug}`}>{tool.name}</Link>
            </h3>
            <p className={styles.cardMeta}>Overall {benchmark.overall}/100 · Trust {tool.trustScore}</p>
            <p className={styles.cardMeta}>
              {benchmark.metrics
                .slice(0, 4)
                .map((m) => `${m.label} ${m.score}`)
                .join(' · ')}
            </p>
          </article>
        ))}
      </div>
    </>
  );
}
