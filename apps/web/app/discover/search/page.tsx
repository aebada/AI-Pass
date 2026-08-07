import { getDiscoveryHub } from '@/src/lib/discovery-server';
import { ToolCard, DiscoverFilterBar } from '../components/DiscoverComponents';
import styles from '../discover.module.css';

type SearchParams = Record<string, string | string[] | undefined>;

function flag(value: string | string[] | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  const v = Array.isArray(value) ? value[0] : value;
  return v === 'true' || v === '1';
}

function text(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const hub = getDiscoveryHub();
  const result = hub.search.search({
    keyword: text(params.q),
    enterprise: flag(params.enterprise),
    certified: flag(params.certified),
    free: flag(params.free),
    openSource: flag(params.openSource),
    trending: flag(params.trending),
    provider: text(params.provider),
    category: text(params.category) as never,
  });

  return (
    <div>
      <header className={styles.hubHero}>
        <p className={styles.hubEyebrow}>Discovery search</p>
        <h1 className={styles.hubTitle}>Browse the enterprise AI catalog</h1>
        <p className={styles.hubSub}>
          Filter by provider, compliance posture, pricing, and certification — then install or connect into AI-Pass.
        </p>
      </header>
      <form action="/discover/search" method="get" className={styles.searchBar}>
        <input
          name="q"
          defaultValue={text(params.q) ?? ''}
          className={styles.searchInput}
          placeholder="Search tools, categories, deals…"
        />
        <button type="submit" className={styles.btnPrimary}>
          Search
        </button>
      </form>
      <DiscoverFilterBar />
      <p className={styles.heroSub}>{result.total} tools match your filters</p>
      <div className={styles.grid}>
        {result.tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}
