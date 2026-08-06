'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react';
import { CATEGORY_LABELS, MARKETPLACE_CATEGORIES } from '@ai-pass/marketplace-core';
import { STORE_ROUTES } from '@ai-pass/routes';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { StoreAppCard } from '../../../components/store/StoreCards';
import { useStorePlatform, installStoreApp, getInstalledApps } from '../../../components/store/store-client';
import styles from '../store.module.css';

function StoreCategoriesContent() {
  const params = useSearchParams();
  const cat = params.get('cat');
  const { store } = useStorePlatform();
  const installedIds = new Set(getInstalledApps().map((a) => a.id));

  const apps = cat
    ? store.apps.list().filter((a) => a.category === cat)
    : store.apps.list();

  return (
    <WorkspaceLayoutClient title="Categories" subtitle="Browse apps by industry and function">
      <div className={styles.marketplace}>
        <Link href={STORE_ROUTES.home} className={styles.navLink}>← Store Home</Link>
        <div className={styles.categoryGrid} style={{ marginTop: 16 }}>
          <Link href={STORE_ROUTES.categories} className={styles.categoryChip}>All</Link>
          {MARKETPLACE_CATEGORIES.map((id) => (
            <Link key={id} href={STORE_ROUTES.category(id)} className={styles.categoryChip}>
              {CATEGORY_LABELS[id]}
            </Link>
          ))}
        </div>
        <h2 className={styles.sectionTitle} style={{ marginTop: 24 }}>
          {cat ? CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat : 'All Apps'}
        </h2>
        <div className={styles.grid}>
          {apps.map((app) => (
            <StoreAppCard
              key={app.id}
              app={app}
              installed={installedIds.has(app.id)}
              onInstall={installStoreApp}
            />
          ))}
        </div>
      </div>
    </WorkspaceLayoutClient>
  );
}


export default function StoreCategoriesPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <StoreCategoriesContent />
    </Suspense>
  );
}
