'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CATEGORY_LABELS, MARKETPLACE_CATEGORIES } from '@ai-pass/marketplace-core';
import { STORE_ROUTES } from '@ai-pass/routes';
import { Badge, Button } from '@ai-pass/ui';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import { StoreAppCard, StoreSectionRow } from '../../components/store/StoreCards';
import {
  getStoreHomeData,
  installStoreApp,
  getInstalledApps,
  DEMO_TENANT,
} from '../../components/store/store-client';
import styles from './store.module.css';

export default function StoreHomePage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const home = getStoreHomeData();
  const installedIds = new Set(getInstalledApps().map((a) => a.id));

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`${STORE_ROUTES.search}?q=${encodeURIComponent(query)}`);
  }

  return (
    <WorkspaceLayoutClient title="AI Pass Store" subtitle="Discover, install, and run AI apps">
      <div className={styles.marketplace}>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>AI Pass Store</h1>
          <p className={styles.heroSub}>
            Central distribution for hosted apps, agent packs, skill packs, and enterprise solutions.
            Every execution routes through AI Wallet and membership gates.
          </p>
          <form className={styles.searchBar} onSubmit={handleSearch}>
            <input
              className={styles.searchInput}
              placeholder="Search apps — keyword or semantic…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button type="submit" variant="primary" size="sm">Search</Button>
          </form>
          <nav className={styles.navLinks}>
            <Link href={STORE_ROUTES.categories} className={styles.navLink}>Categories</Link>
            <Link href={STORE_ROUTES.search} className={styles.navLink}>Browse all</Link>
            <Link href={STORE_ROUTES.installed} className={styles.navLink}>Installed Apps</Link>
            <Link href={STORE_ROUTES.developer} className={styles.navLink}>Developer Dashboard</Link>
            <Link href={STORE_ROUTES.submit} className={styles.navLink}>Publish App</Link>
            <Link href={STORE_ROUTES.enterprise} className={styles.navLink}>Enterprise Store</Link>
            <Link href={STORE_ROUTES.billing} className={styles.navLink}>Wallet & Billing</Link>
          </nav>
        </div>

        <StoreSectionRow title="Featured" href={`${STORE_ROUTES.search}?featured=true`}>
          {home.featured.map((app) => (
            <StoreAppCard
              key={app.id}
              app={app}
              installed={installedIds.has(app.id)}
              onInstall={installStoreApp}
            />
          ))}
        </StoreSectionRow>

        <StoreSectionRow title="Recommended" href={STORE_ROUTES.search}>
          {home.recommended.map((app) => (
            <StoreAppCard key={app.id} app={app} installed={installedIds.has(app.id)} onInstall={installStoreApp} />
          ))}
        </StoreSectionRow>

        <StoreSectionRow title="Trending" href={`${STORE_ROUTES.search}?trending=true`}>
          {home.trending.map((app) => (
            <StoreAppCard key={app.id} app={app} installed={installedIds.has(app.id)} onInstall={installStoreApp} />
          ))}
        </StoreSectionRow>

        <StoreSectionRow title="New Releases" href={STORE_ROUTES.search}>
          {home.newReleases.map((app) => (
            <StoreAppCard key={app.id} app={app} installed={installedIds.has(app.id)} onInstall={installStoreApp} />
          ))}
        </StoreSectionRow>

        <StoreSectionRow title="Enterprise" href={`${STORE_ROUTES.search}?enterprise=true`}>
          {home.enterprise.map((app) => (
            <StoreAppCard key={app.id} app={app} installed={installedIds.has(app.id)} onInstall={installStoreApp} />
          ))}
        </StoreSectionRow>

        <StoreSectionRow title="Free & Open Source">
          {[...home.free, ...home.openSource].slice(0, 6).map((app) => (
            <StoreAppCard key={app.id} app={app} installed={installedIds.has(app.id)} onInstall={installStoreApp} />
          ))}
        </StoreSectionRow>

        <StoreSectionRow title="Automation & Agent Packs">
          {[...home.automationPacks, ...home.agentPacks, ...home.skillPacks].slice(0, 6).map((app) => (
            <StoreAppCard key={app.id} app={app} installed={installedIds.has(app.id)} onInstall={installStoreApp} />
          ))}
        </StoreSectionRow>

        <StoreSectionRow title="Recently Updated">
          {home.recentlyUpdated.map((app) => (
            <StoreAppCard key={app.id} app={app} installed={installedIds.has(app.id)} onInstall={installStoreApp} />
          ))}
        </StoreSectionRow>

        {home.deals.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Deals</h2>
            <div className={styles.grid}>
              {home.deals.map((deal) => (
                <div key={deal.id} className={styles.dealCard}>
                  <h3>{deal.title}</h3>
                  <p className={styles.cardDesc}>{deal.description}</p>
                  <Badge variant="pro">{deal.discountPercent}% off</Badge>
                  {deal.code && <p className={styles.cardMeta}>Code: {deal.code}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {home.collections.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Collections</h2>
            <div className={styles.grid}>
              {home.collections.map((col) => (
                <Link key={col.id} href={STORE_ROUTES.search} className={styles.categoryChip}>
                  <strong>{col.name}</strong>
                  <p className={styles.cardDesc}>{col.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Browse by Category</h2>
          <div className={styles.categoryGrid}>
            {MARKETPLACE_CATEGORIES.map((id) => (
              <Link key={id} href={STORE_ROUTES.category(id)} className={styles.categoryChip}>
                {CATEGORY_LABELS[id]}
              </Link>
            ))}
          </div>
        </section>

        <p className={styles.cardMeta}>
          Demo tenant: {DEMO_TENANT} · {installedIds.size} apps installed
        </p>
      </div>
    </WorkspaceLayoutClient>
  );
}
