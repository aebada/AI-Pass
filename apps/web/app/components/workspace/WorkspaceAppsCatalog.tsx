'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Application } from '@ai-pass/marketplace-core';
import { getTrustSummaryForResource } from '@ai-pass/trust-engine';
import { Badge, Button, Card, workspaceTokens } from '@ai-pass/ui';
import { STORE_ROUTES, getInstalledApps, installStoreApp, useStorePlatform } from '../store/store-client';
import styles from './WorkspaceAppsCatalog.module.css';

const APP_ICONS: Record<string, string> = {
  finance: '🧾',
  supply_chain: '📦',
  customer_support: '💬',
  hr: '👥',
  compliance: '⚖',
  developer_tools: '🛠',
  legal: '📜',
  marketing: '📣',
  sales: '💼',
  knowledge: '📚',
  vision_ai: '👁',
  iot: '📡',
  healthcare: '🩺',
  manufacturing: '🏭',
  education: '🎓',
  analytics: '📊',
  automation: '⚡',
  voice_ai: '🎙',
  ai_agents: '🤖',
};

export type ScoredApp = Application & {
  trustScore: number;
  trustLevel?: string;
  certifiedFromTrust: boolean;
};

function computeTrustScore(app: Application): { trustScore: number; trustLevel?: string; certifiedFromTrust: boolean } {
  const trust = getTrustSummaryForResource(app.slug) ?? getTrustSummaryForResource(app.id);
  if (trust?.trustScore != null) {
    return {
      trustScore: trust.trustScore,
      trustLevel: trust.certificationLevel,
      certifiedFromTrust: Boolean(trust.certified),
    };
  }

  let score = app.rating * 18;
  if (app.certified) score += 12;
  if (app.enterpriseReady) score += 8;
  if (app.reviewCount > 50) score += 5;
  if (app.installCount > 1000) score += 7;
  return {
    trustScore: Math.min(100, Math.round(score)),
    certifiedFromTrust: false,
  };
}

function scoreTone(score: number): string {
  if (score >= 90) return styles.scoreElite;
  if (score >= 80) return styles.scoreHigh;
  if (score >= 70) return styles.scoreMid;
  return styles.scoreLow;
}

function categoryLabel(category: string): string {
  return category.replace(/_/g, ' ');
}

export function WorkspaceAppsCatalog() {
  const platform = useStorePlatform();
  const allApps = useMemo(() => platform.store.apps.list(), [platform]);
  const [installedIds, setInstalledIds] = useState(() => new Set(getInstalledApps().map((a) => a.id)));
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<'trust' | 'rating' | 'installs' | 'name'>('trust');

  const scoredApps: ScoredApp[] = useMemo(() => {
    return allApps.map((app) => {
      const trust = computeTrustScore(app);
      return { ...app, ...trust };
    });
  }, [allApps]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const app of scoredApps) {
      counts.set(app.category, (counts.get(app.category) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [scoredApps]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = scoredApps.filter((app) => {
      if (category !== 'all' && app.category !== category) return false;
      if (!q) return true;
      return (
        app.name.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q) ||
        app.tags.some((t) => t.toLowerCase().includes(q)) ||
        app.category.toLowerCase().includes(q)
      );
    });

    list = [...list].sort((a, b) => {
      if (sort === 'trust') return b.trustScore - a.trustScore || b.rating - a.rating;
      if (sort === 'rating') return b.rating - a.rating || b.trustScore - a.trustScore;
      if (sort === 'installs') return b.installCount - a.installCount;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [scoredApps, query, category, sort]);

  const avgTrust = scoredApps.length
    ? Math.round(scoredApps.reduce((sum, a) => sum + a.trustScore, 0) / scoredApps.length)
    : 0;
  const certifiedCount = scoredApps.filter((a) => a.certified || a.certifiedFromTrust).length;

  const handleInstall = (appId: string) => {
    installStoreApp(appId);
    setInstalledIds(new Set(getInstalledApps().map((a) => a.id)));
  };

  return (
    <section className={styles.catalog} aria-labelledby="workspace-apps-heading">
      <div className={styles.header}>
        <div>
          <h2 id="workspace-apps-heading" className={styles.title}>
            AI Applications
          </h2>
          <p className={styles.subtitle}>
            Browse enterprise AI apps with trust scores, ratings, and install readiness — open any app
            or install into your workspace.
          </p>
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <strong>{scoredApps.length}</strong>
            <span>Apps</span>
          </div>
          <div className={styles.stat}>
            <strong>{avgTrust}</strong>
            <span>Avg trust</span>
          </div>
          <div className={styles.stat}>
            <strong>{certifiedCount}</strong>
            <span>Certified</span>
          </div>
          <div className={styles.stat}>
            <strong>{installedIds.size}</strong>
            <span>Installed</span>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <input
          className={styles.search}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search apps, categories, tags…"
          aria-label="Search AI applications"
        />
        <select
          className={styles.select}
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          aria-label="Sort applications"
        >
          <option value="trust">Sort by trust score</option>
          <option value="rating">Sort by rating</option>
          <option value="installs">Sort by installs</option>
          <option value="name">Sort by name</option>
        </select>
        <Link href="/workspace/store" className={styles.storeLink}>
          Open full App Store →
        </Link>
      </div>

      <div className={styles.filters} role="tablist" aria-label="App categories">
        <button
          type="button"
          className={category === 'all' ? styles.filterActive : styles.filter}
          onClick={() => setCategory('all')}
        >
          All ({scoredApps.length})
        </button>
        {categories.map(([cat, count]) => (
          <button
            key={cat}
            type="button"
            className={category === cat ? styles.filterActive : styles.filter}
            onClick={() => setCategory(cat)}
          >
            {categoryLabel(cat)} ({count})
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {filtered.map((app) => {
          const icon = APP_ICONS[app.category] ?? '📦';
          const installed = installedIds.has(app.id);
          return (
            <Card key={app.id} variant="glass" hover padding="md" className={styles.card}>
              <div className={styles.cardTop}>
                <div>
                  <h3 className={styles.cardTitle}>
                    <span aria-hidden>{icon}</span> {app.name}
                  </h3>
                  <p className={styles.cardCategory}>{categoryLabel(app.category)}</p>
                </div>
                <div className={`${styles.scoreBadge} ${scoreTone(app.trustScore)}`} title="Trust score">
                  <span className={styles.scoreValue}>{app.trustScore}</span>
                  <span className={styles.scoreLabel}>Trust</span>
                </div>
              </div>

              <p className={styles.cardDesc}>{app.description.slice(0, 140)}{app.description.length > 140 ? '…' : ''}</p>

              <div className={styles.badges}>
                {(app.certified || app.certifiedFromTrust) && <Badge variant="success">Certified</Badge>}
                {app.trustLevel && <Badge variant="pro">{app.trustLevel.toUpperCase()}</Badge>}
                {app.enterpriseReady && <Badge variant="pro">Enterprise</Badge>}
                {installed && <Badge variant="default">Installed</Badge>}
                {app.trending && <Badge variant="outline">Trending</Badge>}
                <Badge variant="outline">{app.pricingModel.replace(/_/g, ' ')}</Badge>
              </div>

              <div className={styles.metaRow}>
                <span>★ {app.rating.toFixed(1)}</span>
                <span>{app.reviewCount} reviews</span>
                <span>{app.installCount.toLocaleString()} installs</span>
                <span style={{ color: workspaceTokens.colors.textMuted }}>Risk {app.riskLevel}</span>
              </div>

              <div className={styles.cardActions}>
                <Link href={STORE_ROUTES.app(app.slug)}>
                  <Button variant="secondary" size="sm">Details</Button>
                </Link>
                {!installed ? (
                  <Button variant="primary" size="sm" onClick={() => handleInstall(app.id)}>
                    Install
                  </Button>
                ) : (
                  <Link href={`/workspace/apps`}>
                    <Button variant="secondary" size="sm">Open</Button>
                  </Link>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className={styles.empty}>No applications match this filter. Try another category or search.</p>
      )}
    </section>
  );
}
