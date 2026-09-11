import type { Metadata } from 'next';
import { getDiscoveryHub } from '@/src/lib/discovery-server';
import { ToolSection, DealCard, CollectionCard, NewsItem, ResearchItem } from './components/DiscoverComponents';
import Link from 'next/link';
import styles from './discover.module.css';

export const metadata: Metadata = {
  title: 'AI Pass Discovery - Find, Compare & Install AI Tools',
  description: 'The front door to AI Pass - discover trending AI tools, compare alternatives, and install in one click.',
};

export default function DiscoverHomePage() {
  const hub = getDiscoveryHub();
  const home = hub.discovery.getHome('demo-user');
  hub.analytics.track({ type: 'view', resourceType: 'page', resourceId: 'discover-home' });

  return (
    <>
      <form action="/discover/search" method="get" className={styles.searchBar}>
        <input name="q" className={styles.searchInput} placeholder="Search AI tools, categories, use cases…" />
        <button type="submit" className={styles.btnPrimary}>Search</button>
      </form>

      <ToolSection title="Featured" tools={home.featured} href="/discover/trending" />
      <ToolSection title="Trending" tools={home.trending} href="/discover/trending" />
      <ToolSection title="Editor's Picks" tools={home.editorsPicks} />
      <ToolSection title="Recently Added" tools={home.recentlyAdded} />
      <ToolSection title="Most Installed" tools={home.mostInstalled} />
      <ToolSection title="Highest Rated" tools={home.highestRated} />
      <ToolSection title="Enterprise Ready" tools={home.enterpriseReady} />

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Best AI Lists</h2>
          <Link href="/discover/best/finance" className={styles.sectionLink}>Browse all →</Link>
        </div>
        <div className={styles.subNav}>
          {['finance', 'hr', 'developers', 'agents', 'enterprise', 'free'].map((slug) => (
            <Link key={slug} href={`/discover/best/${slug}`} className={styles.subNavLink}>
              Best {slug}
            </Link>
          ))}
        </div>
        <ToolSection title="" tools={home.bestAiTools} />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Collections</h2>
          <Link href="/discover/collections" className={styles.sectionLink}>View all →</Link>
        </div>
        <div className={styles.grid}>
          {home.collections.map((c) => <CollectionCard key={c.id} collection={c} />)}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Deals Hub</h2>
          <Link href="/discover/deals" className={styles.sectionLink}>All deals →</Link>
        </div>
        <div className={styles.grid}>
          {home.deals.map((d) => <DealCard key={d.id} deal={d} />)}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>AI News</h2>
          <Link href="/discover/news" className={styles.sectionLink}>More news →</Link>
        </div>
        {home.news.map((n) => <NewsItem key={n.id} article={n} />)}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>AI Research</h2>
          <Link href="/discover/research" className={styles.sectionLink}>More research →</Link>
        </div>
        {home.research.map((r) => <ResearchItem key={r.id} article={r} />)}
      </section>

      {home.recommendedForYou && home.recommendedForYou.length > 0 && (
        <ToolSection title="Recommended for You" tools={home.recommendedForYou} />
      )}
    </>
  );
}
