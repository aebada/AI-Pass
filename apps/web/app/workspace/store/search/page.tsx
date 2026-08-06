'use client';

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react';
import Link from 'next/link';
import { STORE_ROUTES } from '@ai-pass/routes';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { StoreAppCard } from '../../../components/store/StoreCards';
import { useStorePlatform, installStoreApp, getInstalledApps } from '../../../components/store/store-client';
import styles from '../store.module.css';

function StoreSearchContent() {
  const params = useSearchParams();
  const q = params.get('q') ?? '';
  const { store } = useStorePlatform();
  const installedIds = new Set(getInstalledApps().map((a) => a.id));

  const filters = {
    keyword: q || undefined,
    trending: params.get('trending') === 'true' || undefined,
    enterpriseReady: params.get('enterprise') === 'true' || undefined,
    certified: params.get('certified') === 'true' || undefined,
    free: params.get('free') === 'true' || undefined,
    semantic: params.get('semantic') === 'true' || undefined,
  };

  const result = store.search(filters);

  return (
    <WorkspaceLayoutClient title="Search Results" subtitle={q ? `Results for "${q}"` : 'Browse all apps'}>
      <div className={styles.marketplace}>
        <Link href={STORE_ROUTES.home} className={styles.navLink}>← Store Home</Link>
        <p className={styles.cardMeta}>{result.total} apps found</p>
        <div className={styles.grid}>
          {result.apps.map((app) => (
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


export default function StoreSearchPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <StoreSearchContent />
    </Suspense>
  );
}
