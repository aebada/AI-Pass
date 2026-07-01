import { getDiscoveryHub } from '@/src/lib/discovery-server';
import { ToolCard } from '../components/DiscoverComponents';
import styles from '../discover.module.css';

export default function SearchPage() {
  const hub = getDiscoveryHub();
  const result = hub.search.search({});

  return (
    <div>
      <form action="/discover/search" method="get" className={styles.searchBar}>
        <input name="q" className={styles.searchInput} placeholder="Search tools, categories, deals…" />
        <button type="submit" className={styles.btnPrimary}>Search</button>
      </form>
      <p className={styles.heroSub}>{result.total} tools match your filters</p>
      <div className={styles.toolGrid}>
        {result.tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}
