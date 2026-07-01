'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@ai-pass/ui';
import { CATEGORY_LABELS, MARKETPLACE_CATEGORIES } from '@ai-pass/marketplace-core';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { AppCard } from '../../../components/marketplace/MarketplaceCards';
import { useMarketplacePlatform, installApp } from '../../../components/marketplace/marketplace-client';
import styles from '../marketplace.module.css';

export default function CategoriesContent() {
  const searchParams = useSearchParams();
  const activeCat = searchParams.get('cat');
  const platform = useMarketplacePlatform();

  const apps = activeCat
    ? platform.search.getByCategory(activeCat as never)
    : platform.apps.list();

  return (
    <WorkspaceLayoutClient
      title="Categories"
      subtitle="Browse apps by industry and use case"
    >
      <div className={styles.filters}>
        <Link href="/workspace/marketplace/categories">
          <button type="button" className={`${styles.filterBtn} ${!activeCat ? styles.filterActive : ''}`}>
            All
          </button>
        </Link>
        {MARKETPLACE_CATEGORIES.map((cat) => (
          <Link key={cat} href={`/workspace/marketplace/categories?cat=${cat}`}>
            <button
              type="button"
              className={`${styles.filterBtn} ${activeCat === cat ? styles.filterActive : ''}`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          </Link>
        ))}
      </div>

      <div className={styles.grid}>
        {apps.map((app) => (
          <AppCard key={app.id} app={app} onInstall={(id) => installApp(id)} />
        ))}
      </div>

      {apps.length === 0 && (
        <Badge variant="outline">No apps in this category yet.</Badge>
      )}
    </WorkspaceLayoutClient>
  );
}
