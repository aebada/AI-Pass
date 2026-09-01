import type { Metadata } from 'next';
import { getDiscoveryHub } from '@/src/lib/discovery-server';
import { ToolSection, DealCard, CollectionCard, NewsItem, ResearchItem } from './components/DiscoverComponents';
import Link from 'next/link';
import styles from './discover.module.css';

export const metadata: Metadata = {
  title: 'AI Discovery Hub — Discover, Evaluate, Deploy & Orchestrate AI',
  description:
    'Enterprise AI Discovery Hub: search thousands of AI tools, compare, benchmark, install, connect to workflows and agents, and govern with Trust Scores — not just a directory.',
};

export default function DiscoverHomePage() {
  const hub = getDiscoveryHub();
  const home = hub.discovery.getHome('demo-user');
  const stats = hub.discovery.catalogStats();
  const taxonomy = hub.discovery.getTaxonomy();
  hub.analytics.track({ type: 'view', resourceType: 'page', resourceId: 'discover-home' });

  return (
    <>
      <p className={styles.heroSub}>
        Discover → Compare → Test → Install → Connect → Automate → Govern → Monitor — not a static AI directory.
        Catalog: {stats.totalTools.toLocaleString()} indexed (target {stats.targetCatalogSize.toLocaleString()}+) ·{' '}
        {stats.goldCertified} Gold/Platinum certified.
      </p>

      <form action="/discover/search" method="get" className={styles.searchBar}>
        <input
          name="q"
          className={styles.searchInput}
          placeholder="Search by category, model, compliance, local deploy, API…"
        />
        <button type="submit" className={styles.btnPrimary}>Search</button>
      </form>

      <div className={styles.subNav}>
        <Link href="/discover/taxonomy" className={styles.subNavLink}>Taxonomy</Link>
        <Link href="/discover/compare" className={styles.subNavLink}>Compare</Link>
        <Link href="/discover/benchmarks" className={styles.subNavLink}>Benchmarks</Link>
        <Link href="/workspace/playground" className={styles.subNavLink}>Playground</Link>
        <Link href="/discover/enterprise" className={styles.subNavLink}>Enterprise Catalog</Link>
        <Link href="/discover/analytics" className={styles.subNavLink}>Analytics</Link>
        <Link href="/discover/deals" className={styles.subNavLink}>Deals Hub</Link>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Browse by taxonomy</h2>
          <Link href="/discover/taxonomy" className={styles.sectionLink}>All categories →</Link>
        </div>
        <div className={styles.subNav}>
          {taxonomy.slice(0, 10).map((t) => (
            <Link key={t.id} href={`/discover/taxonomy/${t.slug}`} className={styles.subNavLink}>
              {t.label} ({t.toolCount})
            </Link>
          ))}
        </div>
      </section>

      <ToolSection title="Featured" tools={home.featured} href="/discover/trending" />
      <ToolSection title="Trending" tools={home.trending} href="/discover/trending" />
      <ToolSection title="Highest Trust Score" tools={home.highestTrust ?? []} href="/discover/analytics" />
      <ToolSection title="Editor's Picks" tools={home.editorsPicks} />
      <ToolSection title="Recently Added" tools={home.recentlyAdded} />
      <ToolSection title="Most Installed" tools={home.mostInstalled} />
      <ToolSection title="Highest Rated" tools={home.highestRated} />
      <ToolSection title="Enterprise Ready" tools={home.enterpriseReady} />

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Curated collections</h2>
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
          <h2 className={styles.sectionTitle}>AI Research & Benchmarks</h2>
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
