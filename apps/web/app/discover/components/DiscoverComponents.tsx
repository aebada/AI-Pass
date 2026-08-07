import Link from 'next/link';
import type { Tool, DiscoveryDeal, Collection, NewsArticle, ResearchArticle } from '@ai-pass/discovery-hub';
import styles from '../discover.module.css';

function ToolLogo({ tool }: { tool: Tool }) {
  const initials = tool.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <div className={styles.toolLogo} aria-hidden>
      <span>{initials || 'AI'}</span>
    </div>
  );
}

export function DiscoverSubNav({ base = '/discover' }: { base?: string }) {
  const links = [
    { href: base, label: 'Home' },
    { href: `${base}/search`, label: 'Search' },
    { href: `${base}/categories`, label: 'Categories' },
    { href: `${base}/collections`, label: 'Collections' },
    { href: `${base}/deals`, label: 'Deals' },
    { href: `${base}/trending`, label: 'Trending' },
    { href: `${base}/news`, label: 'AI News' },
    { href: `${base}/research`, label: 'Research' },
    { href: `${base}/developers/promotions`, label: 'Dev Promos' },
  ];

  return (
    <nav className={styles.subNav}>
      {links.map((l) => (
        <Link key={l.href} href={l.href} className={styles.subNavLink}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

export function DiscoverFilterBar({ base = '/discover/search' }: { base?: string }) {
  const filters = [
    { q: '', label: 'All tools', href: base },
    { q: 'enterprise=true', label: 'Enterprise', href: `${base}?enterprise=true` },
    { q: 'certified=true', label: 'Certified', href: `${base}?certified=true` },
    { q: 'free=true', label: 'Free', href: `${base}?free=true` },
    { q: 'openSource=true', label: 'Open source', href: `${base}?openSource=true` },
    { q: 'trending=true', label: 'Trending', href: `${base}?trending=true` },
    { q: 'provider=OpenAI', label: 'OpenAI', href: `${base}?provider=OpenAI` },
    { q: 'provider=Anthropic', label: 'Anthropic', href: `${base}?provider=Anthropic` },
    { q: 'provider=Local', label: 'Local / air-gapped', href: `${base}?provider=Local` },
  ];
  return (
    <div className={styles.filterBar} role="navigation" aria-label="Discovery filters">
      {filters.map((f) => (
        <Link key={f.label} href={f.href} className={styles.filterChip}>
          {f.label}
        </Link>
      ))}
    </div>
  );
}

export function ToolCard({ tool, base = '/discover' }: { tool: Tool; base?: string }) {
  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <ToolLogo tool={tool} />
        <div className={styles.cardHeaderText}>
          <h3 className={styles.cardTitle}>
            <Link href={`${base}/tools/${tool.slug}`}>{tool.name}</Link>
          </h3>
          <p className={styles.cardMeta}>
            {tool.provider} · {tool.pricingLabel}
            {tool.apiAvailable ? ' · API' : ''}
          </p>
        </div>
      </div>
      <div className={styles.badges}>
        {tool.certified && <span className={styles.badge}>Certified</span>}
        {tool.trending && <span className={styles.badge}>Trending</span>}
        {tool.enterpriseReady && <span className={styles.badge}>Enterprise</span>}
        <span className={`${styles.badge} ${styles.badgeTrust}`}>Trust {tool.trustScore}</span>
      </div>
      <p className={styles.cardMeta}>{tool.description.slice(0, 120)}…</p>
      <p className={styles.cardMeta}>
        ★ {tool.rating.toFixed(1)} · {tool.latencyMs}ms · {tool.installCount.toLocaleString()} installs
      </p>
      <div className={styles.cardActions}>
        <Link href={tool.storeRoute} className={styles.btnPrimary}>Install</Link>
        <Link href={tool.connectRoute} className={styles.btnSecondary}>Connect</Link>
        <Link href={`${base}/compare?a=${tool.id}`} className={styles.btnSecondary}>Compare</Link>
      </div>
    </article>
  );
}

export function ToolSection({ title, tools, href, base = '/discover' }: { title: string; tools: Tool[]; href?: string; base?: string }) {
  if (tools.length === 0) return null;
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {href && <Link href={href} className={styles.sectionLink}>View all →</Link>}
      </div>
      <div className={styles.grid}>
        {tools.map((t) => <ToolCard key={t.id} tool={t} base={base} />)}
      </div>
    </section>
  );
}

export function DealCard({ deal, base = '/discover' }: { deal: DiscoveryDeal; base?: string }) {
  const ends = new Date(deal.countdownEndsAt);
  const daysLeft = Math.max(0, Math.ceil((ends.getTime() - Date.now()) / 86400000));

  return (
    <article className={styles.card}>
      <span className={`${styles.badge} ${styles.badgeDeal}`}>{deal.dealType.replace('_', ' ')}</span>
      <h3 className={styles.cardTitle}>
        <Link href={`${base}/deals/${deal.id}`}>{deal.title}</Link>
      </h3>
      <p className={styles.cardMeta}>{deal.description}</p>
      {deal.dealPrice !== undefined && (
        <p className={styles.dealPrice}>
          ${deal.dealPrice}
          {deal.originalPrice !== undefined && (
            <span className={styles.dealSavings}> · Save {deal.savingsPercent}%</span>
          )}
        </p>
      )}
      <p className={styles.countdown}>{daysLeft}d left</p>
      <Link href={`${base}/deals/${deal.id}`} className={styles.btnPrimary}>View deal</Link>
    </article>
  );
}

export function CollectionCard({ collection, base = '/discover' }: { collection: Collection; base?: string }) {
  return (
    <article className={styles.card}>
      <h3 className={styles.cardTitle}>
        <Link href={`${base}/collections/${collection.slug}`}>{collection.name}</Link>
      </h3>
      <p className={styles.cardMeta}>{collection.description}</p>
      <p className={styles.cardMeta}>{collection.toolIds.length} tools</p>
    </article>
  );
}

export function NewsItem({ article }: { article: NewsArticle }) {
  return (
    <div className={styles.listItem}>
      <p className={styles.listItemTitle}>{article.title}</p>
      <p className={styles.cardMeta}>{article.summary}</p>
      <p className={styles.listItemMeta}>{article.source} · {new Date(article.publishedAt).toLocaleDateString()}</p>
    </div>
  );
}

export function ResearchItem({ article }: { article: ResearchArticle }) {
  return (
    <div className={styles.listItem}>
      <p className={styles.listItemTitle}>{article.title}</p>
      <p className={styles.cardMeta}>{article.summary}</p>
      <p className={styles.listItemMeta}>{article.type} · {new Date(article.publishedAt).toLocaleDateString()}</p>
    </div>
  );
}
