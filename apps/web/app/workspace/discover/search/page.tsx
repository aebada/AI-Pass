import Link from 'next/link';
import { getDiscoveryHub } from '@/src/lib/discovery-server';
import { DiscoverSubNav, ToolCard } from '../../../discover/components/DiscoverComponents';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import styles from '../../../discover/discover.module.css';

export default function WorkspaceDiscoverSearchPage() {
  const params: { q?: string } = {};
  const hub = getDiscoveryHub();
  const result = hub.search.search({ keyword: params.q });
  const recommended = hub.recommendations.resolveTools(
    hub.recommendations.personalized('demo-user', 4),
  );

  return (
    <WorkspaceLayoutClient title="Discover Search" subtitle="Search with your workspace context">
      <DiscoverSubNav base="/workspace/discover" />
      <form action="/workspace/discover/search" method="get" className={styles.searchBar}>
        <input name="q" defaultValue={params.q ?? ''} className={styles.searchInput} placeholder="Search…" />
        <button type="submit" className={styles.btnPrimary}>Search</button>
      </form>
      {recommended.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Recommended for You</h2>
          <div className={styles.grid}>
            {recommended.map((t) => <ToolCard key={t.id} tool={t} base="/discover" />)}
          </div>
        </section>
      )}
      <div className={styles.grid}>
        {result.tools.map((t) => <ToolCard key={t.id} tool={t} base="/discover" />)}
      </div>
      <p className={styles.cardMeta}>
        <Link href="/discover">Public Discovery Hub →</Link>
      </p>
    </WorkspaceLayoutClient>
  );
}
