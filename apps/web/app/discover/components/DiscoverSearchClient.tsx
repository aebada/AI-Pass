'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Tool } from '@ai-pass/discovery-hub';
import { ToolCard, DiscoverFilterBar } from './DiscoverComponents';
import styles from '../discover.module.css';

export function DiscoverSearchClient({
  tools,
  catalogTotal,
}: {
  tools: Tool[];
  catalogTotal: number;
}) {
  const params = useSearchParams();
  const q = (params.get('q') ?? '').trim().toLowerCase();
  const enterprise = params.get('enterprise') === 'true';
  const certified = params.get('certified') === 'true';
  const free = params.get('free') === 'true';
  const openSource = params.get('openSource') === 'true';
  const trending = params.get('trending') === 'true';
  const provider = (params.get('provider') ?? '').toLowerCase();

  const filtered = useMemo(() => {
    return tools.filter((t) => {
      if (enterprise && !t.enterpriseReady) return false;
      if (certified && !t.certified) return false;
      if (free && t.pricingModel !== 'free') return false;
      if (openSource && !t.openSource) return false;
      if (trending && !t.trending) return false;
      if (provider) {
        const hit =
          t.provider.toLowerCase().includes(provider) ||
          t.modelsUsed.some((m) => m.toLowerCase().includes(provider));
        if (!hit) return false;
      }
      if (q) {
        const hay = `${t.name} ${t.description} ${t.tags.join(' ')} ${t.provider}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [tools, q, enterprise, certified, free, openSource, trending, provider]);

  return (
    <div>
      <header className={styles.hubHero}>
        <p className={styles.hubEyebrow}>Discovery search</p>
        <h1 className={styles.hubTitle}>Browse the enterprise AI catalog</h1>
        <p className={styles.hubSub}>
          Filter by provider, compliance posture, pricing, and certification — then install or connect into AI-Pass.
        </p>
      </header>
      <form action="/discover/search" method="get" className={styles.searchBar}>
        <input
          name="q"
          defaultValue={params.get('q') ?? ''}
          className={styles.searchInput}
          placeholder="Search tools, categories, deals…"
        />
        <button type="submit" className={styles.btnPrimary}>
          Search
        </button>
      </form>
      <DiscoverFilterBar />
      <p className={styles.heroSub}>
        {filtered.length} of {catalogTotal} tools match your filters
      </p>
      <div className={styles.grid}>
        {filtered.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}
