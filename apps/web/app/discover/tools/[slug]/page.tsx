import type { Metadata } from 'next';
import Link from 'next/link';
import { getDiscoveryHub } from '@/src/lib/discovery-server';
import { ToolCard } from '../../components/DiscoverComponents';
import styles from '../../discover.module.css';

export function generateStaticParams() {
  const hub = getDiscoveryHub();
  return hub.discovery.listTools().map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const hub = getDiscoveryHub();
  const tool = hub.discovery.getTool(slug);
  if (!tool) return { title: 'Tool | AI Pass Discovery' };
  const seo = hub.seo.forTool(tool.name, tool.slug, tool.category);
  return { title: seo.title, description: seo.description, keywords: seo.keywords };
}

export default async function ToolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hub = getDiscoveryHub();
  const tool = hub.discovery.getTool(slug);

  if (!tool) {
    return <p className={styles.heroSub}>Tool not found.</p>;
  }

  const reviews = hub.marketplace.reviews.listForResource(tool.id);
  const similar = hub.recommendations.resolveTools(hub.recommendations.similar(tool.id, 3));
  const actions = hub.getToolActions(tool, { orgId: 'demo-org' });
  const ratings = tool.profile.ratings;
  const trust = tool.profile.trust;
  const benchmark = tool.profile.latestBenchmark;

  hub.analytics.track({ type: 'view', resourceType: 'tool', resourceId: tool.id });

  return (
    <div className={styles.detailGrid}>
      <div>
        <p className={styles.eyebrow}>
          {tool.profile.general.developer}
          {tool.profile.general.country ? ` · ${tool.profile.general.country}` : ''}
          {tool.profile.general.launchDate ? ` · Launched ${tool.profile.general.launchDate.slice(0, 10)}` : ''}
        </p>
        <h1 className={styles.heroTitle}>{tool.name}</h1>
        <p className={styles.heroSub}>{tool.description}</p>
        {tool.profile.general.website && (
          <p className={styles.cardMeta}>
            <a href={tool.profile.general.website} target="_blank" rel="noreferrer">
              {tool.profile.general.website}
            </a>
          </p>
        )}

        <div className={styles.badges} style={{ margin: '1rem 0' }}>
          {tool.trustBadges.map((b) => (
            <span key={b} className={`${styles.badge} ${styles.badgeTrust}`}>{b}</span>
          ))}
          <span className={styles.badge}>
            AI Trust Score {tool.trustScore}/100
            {trust ? ` · ${trust.label}` : ''}
          </span>
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>AI Capabilities</h2>
          <p className={styles.cardMeta}>{tool.profile.capabilities.join(' · ')}</p>
          <p className={styles.cardMeta}>Models: {tool.profile.supportedModels.join(', ')}</p>
          <p className={styles.cardMeta}>Deployment: {tool.profile.deployment.join(', ')}</p>
          <p className={styles.cardMeta}>Pricing: {tool.profile.pricing.join(', ')}</p>
          <p className={styles.cardMeta}>
            Integrations: {tool.profile.integrations.length ? tool.profile.integrations.join(', ') : '—'}
          </p>
          <p className={styles.cardMeta}>
            Security: {tool.profile.compliance.length ? tool.profile.compliance.join(', ').toUpperCase() : '—'}
          </p>
          <p className={styles.cardMeta}>
            Install methods: {tool.profile.installMethods.join(', ')}
            {tool.profile.contextWindow ? ` · Context ${tool.profile.contextWindow.toLocaleString()} tokens` : ''}
            {tool.profile.latencyMs ? ` · ~${tool.profile.latencyMs}ms` : ''}
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Features</h2>
          <ul className={styles.cardMeta}>
            {tool.features.map((f) => <li key={f}>{f}</li>)}
          </ul>
        </section>

        {ratings && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Ratings</h2>
            <p className={styles.cardMeta}>
              User {ratings.user.toFixed(1)} · Enterprise {ratings.enterprise.toFixed(1)} · Expert {ratings.expert.toFixed(1)}
            </p>
            <ul className={styles.cardMeta}>
              <li>Accuracy {ratings.breakdown.accuracy}</li>
              <li>Ease of Use {ratings.breakdown.easeOfUse}</li>
              <li>Speed {ratings.breakdown.speed}</li>
              <li>Reliability {ratings.breakdown.reliability}</li>
              <li>Documentation {ratings.breakdown.documentation}</li>
              <li>Support {ratings.breakdown.support}</li>
            </ul>
          </section>
        )}

        {trust && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>AI Trust Score Breakdown</h2>
            <ul className={styles.cardMeta}>
              <li>Security {trust.breakdown.security}</li>
              <li>Privacy {trust.breakdown.privacy}</li>
              <li>Compliance {trust.breakdown.compliance}</li>
              <li>Reliability {trust.breakdown.reliability}</li>
              <li>Community {trust.breakdown.communityRating}</li>
              <li>Benchmarks {trust.breakdown.benchmarkResults}</li>
              <li>Maintenance {trust.breakdown.maintenanceFrequency}</li>
            </ul>
          </section>
        )}

        {benchmark && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Benchmarks</h2>
            <p className={styles.cardMeta}>Overall {benchmark.overall}/100 · Measured {benchmark.measuredAt.slice(0, 10)}</p>
            <ul className={styles.cardMeta}>
              {benchmark.metrics.map((m) => (
                <li key={m.key}>{m.label}: {m.score}</li>
              ))}
            </ul>
            <Link href={`/discover/benchmarks?tool=${tool.slug}`} className={styles.sectionLink}>
              View history →
            </Link>
          </section>
        )}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Reviews</h2>
          {reviews.length === 0 ? (
            <p className={styles.cardMeta}>No marketplace reviews yet — ratings above include enterprise & expert scores.</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className={styles.listItem}>
                <p className={styles.listItemTitle}>{'★'.repeat(r.rating)} {r.title}</p>
                <p className={styles.cardMeta}>{r.comment}</p>
              </div>
            ))
          )}
        </section>

        {similar.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Similar Tools</h2>
            <div className={styles.grid}>
              {similar.map((t) => <ToolCard key={t.id} tool={t} />)}
            </div>
          </section>
        )}
      </div>

      <aside>
        <div className={styles.card}>
          <p className={styles.cardMeta}>★ {tool.rating.toFixed(1)} ({tool.reviewCount} reviews)</p>
          <p className={styles.cardMeta}>{tool.installCount.toLocaleString()} installs</p>
          <p className={styles.cardMeta}>Credits: {tool.creditsRequired}</p>
          {tool.estimatedCostPerRun !== undefined && (
            <p className={styles.cardMeta}>Est. cost/run: ${tool.estimatedCostPerRun.toFixed(2)}</p>
          )}
          <p className={styles.cardMeta}>Source: {tool.source === 'marketplace' ? 'AI Store' : 'External catalog'}</p>
          <div className={styles.cardActions} style={{ flexDirection: 'column' }}>
            {actions.map((action) => (
              <Link
                key={action.id}
                href={action.href}
                className={action.primary ? styles.btnPrimary : styles.btnSecondary}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.card} style={{ marginTop: '1rem' }}>
          <h3 className={styles.cardTitle}>Routing</h3>
          <p className={styles.cardMeta}>
            Choose fixed provider, automatic, lowest cost/latency, highest quality, local-only, or compliance-based routing.
          </p>
          <ul className={styles.cardMeta}>
            {hub.routingPreferences.slice(0, 4).map((r) => (
              <li key={r.id}>{r.label}</li>
            ))}
          </ul>
          <Link href={`/workspace/providers?routeTool=${tool.slug}`} className={styles.btnSecondary}>
            Open Routing Engine
          </Link>
        </div>
      </aside>
    </div>
  );
}
