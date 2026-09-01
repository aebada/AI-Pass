import Link from 'next/link';
import { getDiscoveryHub } from '@/src/lib/discovery-server';
import type { DiscoverySearchFilters } from '@ai-pass/discovery-hub';
import { ToolCard } from '../components/DiscoverComponents';
import styles from '../discover.module.css';

type SearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function bool(v: string | undefined): boolean | undefined {
  if (v === '1' || v === 'true') return true;
  return undefined;
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const hub = getDiscoveryHub();

  const filters: DiscoverySearchFilters = {
    keyword: first(sp.q) ?? first(sp.keyword),
    taxonomy: first(sp.taxonomy) as DiscoverySearchFilters['taxonomy'],
    category: first(sp.category) as DiscoverySearchFilters['category'],
    provider: first(sp.provider),
    model: first(sp.model) as DiscoverySearchFilters['model'],
    pricing: first(sp.pricing) as DiscoverySearchFilters['pricing'],
    compliance: first(sp.compliance) as DiscoverySearchFilters['compliance'],
    capability: first(sp.capability) as DiscoverySearchFilters['capability'],
    deployment: first(sp.deployment) as DiscoverySearchFilters['deployment'],
    language: first(sp.language),
    region: first(sp.region),
    free: bool(first(sp.free)),
    openSource: bool(first(sp.openSource)),
    enterprise: bool(first(sp.enterprise)),
    certified: bool(first(sp.certified)),
    apiAvailable: bool(first(sp.api)),
    localDeployment: bool(first(sp.local)),
    minContextWindow: first(sp.minContext) ? Number(first(sp.minContext)) : undefined,
    minTrustScore: first(sp.minTrust) ? Number(first(sp.minTrust)) : undefined,
  };

  const result = hub.search.search(filters);
  hub.analytics.track({
    type: 'search',
    resourceType: 'page',
    resourceId: 'discover-search',
    metadata: { q: filters.keyword, total: result.total },
  });

  return (
    <div>
      <h1 className={styles.heroTitle}>Search the AI catalog</h1>
      <p className={styles.heroSub}>
        Filter by taxonomy, model family, pricing, open source, API, local deployment, compliance, context window, and trust score.
      </p>

      <form action="/discover/search" method="get" className={styles.searchBar}>
        <input
          name="q"
          defaultValue={filters.keyword ?? ''}
          className={styles.searchInput}
          placeholder="Search tools, providers, use cases…"
        />
        <button type="submit" className={styles.btnPrimary}>Search</button>
      </form>

      <form action="/discover/search" method="get" className={styles.subNav}>
        <input type="hidden" name="q" value={filters.keyword ?? ''} />
        <select name="taxonomy" defaultValue={filters.taxonomy ?? ''} className={styles.subNavLink}>
          <option value="">All taxonomies</option>
          {hub.discovery.getTaxonomy().map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
        <select name="model" defaultValue={filters.model ?? ''} className={styles.subNavLink}>
          <option value="">Any model</option>
          {['gpt', 'claude', 'gemini', 'llama', 'mistral', 'deepseek', 'qwen'].map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select name="pricing" defaultValue={filters.pricing ?? ''} className={styles.subNavLink}>
          <option value="">Any pricing</option>
          {['free', 'freemium', 'subscription', 'pay_as_you_go', 'enterprise'].map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select name="compliance" defaultValue={filters.compliance ?? ''} className={styles.subNavLink}>
          <option value="">Any compliance</option>
          {['gdpr', 'soc2', 'iso27001', 'hipaa', 'iso42001'].map((c) => (
            <option key={c} value={c}>{c.toUpperCase()}</option>
          ))}
        </select>
        <label className={styles.subNavLink}>
          <input type="checkbox" name="openSource" value="1" defaultChecked={!!filters.openSource} /> Open source
        </label>
        <label className={styles.subNavLink}>
          <input type="checkbox" name="api" value="1" defaultChecked={!!filters.apiAvailable} /> API
        </label>
        <label className={styles.subNavLink}>
          <input type="checkbox" name="local" value="1" defaultChecked={!!filters.localDeployment} /> Local
        </label>
        <label className={styles.subNavLink}>
          <input type="checkbox" name="enterprise" value="1" defaultChecked={!!filters.enterprise} /> Enterprise
        </label>
        <button type="submit" className={styles.btnSecondary}>Apply filters</button>
      </form>

      <p className={styles.heroSub}>{result.total} tools match · <Link href="/discover/taxonomy">Browse taxonomy</Link></p>
      <div className={styles.grid}>
        {result.tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}
