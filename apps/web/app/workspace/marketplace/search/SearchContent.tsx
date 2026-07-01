'use client';

import { useSearchParams } from 'next/navigation';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { AppCard, SkillCard } from '../../../components/marketplace/MarketplaceCards';
import { useMarketplacePlatform, installApp } from '../../../components/marketplace/marketplace-client';
import styles from '../marketplace.module.css';

export default function SearchContent() {
  const searchParams = useSearchParams();
  const platform = useMarketplacePlatform();

  const filters = {
    keyword: searchParams.get('q') ?? undefined,
    certified: searchParams.get('certified') === 'true' ? true : undefined,
    enterpriseReady: searchParams.get('enterprise') === 'true' ? true : undefined,
    openSource: searchParams.get('openSource') === 'true' ? true : undefined,
    trending: searchParams.get('trending') === 'true' ? true : undefined,
    topRated: searchParams.get('topRated') === 'true' ? true : undefined,
    free: searchParams.get('free') === 'true' ? true : undefined,
    paid: searchParams.get('paid') === 'true' ? true : undefined,
  };

  const results = platform.search.search(filters);

  const filterOptions = [
    { key: 'free', label: 'Free' },
    { key: 'paid', label: 'Paid' },
    { key: 'openSource', label: 'Open Source' },
    { key: 'enterprise', label: 'Enterprise' },
    { key: 'certified', label: 'Verified' },
    { key: 'trending', label: 'Trending' },
    { key: 'topRated', label: 'Top Rated' },
  ];

  return (
    <WorkspaceLayoutClient
      title="Search Marketplace"
      subtitle={filters.keyword ? `Results for "${filters.keyword}"` : 'Filter apps and skills'}
    >
      <div className={styles.filters}>
        {filterOptions.map((f) => {
          const active = searchParams.get(f.key) === 'true';
          const params = new URLSearchParams(searchParams.toString());
          if (active) params.delete(f.key);
          else params.set(f.key, 'true');
          return (
            <a key={f.key} href={`/workspace/marketplace/search?${params.toString()}`}>
              <button
                type="button"
                className={`${styles.filterBtn} ${active ? styles.filterActive : ''}`}
              >
                {f.label}
              </button>
            </a>
          );
        })}
      </div>

      <p className={styles.cardMeta}>{results.total} results</p>

      {results.apps.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Apps</h2>
          <div className={styles.grid}>
            {results.apps.map((app) => (
              <AppCard key={app.id} app={app} onInstall={(id) => installApp(id)} />
            ))}
          </div>
        </section>
      )}

      {results.skills.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Skills</h2>
          <div className={styles.grid}>
            {results.skills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </section>
      )}
    </WorkspaceLayoutClient>
  );
}
