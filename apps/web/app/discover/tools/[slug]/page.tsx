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
  let similar: ReturnType<typeof hub.recommendations.resolveTools> = [];
  try {
    similar = hub.recommendations.resolveTools(hub.recommendations.similar(tool.id, 3));
  } catch {
    similar = [];
  }

  hub.analytics.track({ type: 'view', resourceType: 'tool', resourceId: tool.id });

  const initials = tool.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div className={styles.detailGrid}>
      <div>
        <div className={styles.cardHeader} style={{ marginBottom: '1rem' }}>
          <div className={styles.toolLogo} aria-hidden>
            <span>{initials || 'AI'}</span>
          </div>
          <div>
            <h1 className={styles.heroTitle}>{tool.name}</h1>
            <p className={styles.heroSub}>{tool.description}</p>
          </div>
        </div>

        <div className={styles.badges} style={{ margin: '1rem 0' }}>
          {tool.trustBadges.map((b) => (
            <span key={b} className={`${styles.badge} ${styles.badgeTrust}`}>{b}</span>
          ))}
          <span className={styles.badge}>Trust Score {tool.trustScore}/100</span>
          {tool.apiAvailable && <span className={styles.badge}>API available</span>}
        </div>

        <dl className={styles.specGrid}>
          <div className={styles.specItem}>
            <dt>Pricing</dt>
            <dd>{tool.pricingLabel}</dd>
          </div>
          <div className={styles.specItem}>
            <dt>Provider</dt>
            <dd>{tool.provider}</dd>
          </div>
          <div className={styles.specItem}>
            <dt>Latency</dt>
            <dd>{tool.latencyMs} ms</dd>
          </div>
          <div className={styles.specItem}>
            <dt>API</dt>
            <dd>{tool.apiAvailable ? 'Yes' : 'Workspace only'}</dd>
          </div>
        </dl>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Models</h2>
          <p className={styles.cardMeta}>
            {tool.modelsUsed.length > 0 ? tool.modelsUsed.join(' · ') : 'Routed via AI-Pass Provider Hub'}
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Benchmarks</h2>
          {tool.benchmarks.map((b) => (
            <div key={b.name} className={styles.benchmarkRow}>
              <span>{b.name}</span>
              <strong>
                {b.score}
                {b.unit ?? ''}
              </strong>
            </div>
          ))}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Compliance</h2>
          <div className={styles.badges}>
            {tool.complianceFrameworks.length === 0 ? (
              <span className={styles.cardMeta}>Contact sales for compliance mapping</span>
            ) : (
              tool.complianceFrameworks.map((f) => (
                <span key={f} className={styles.badge}>{f}</span>
              ))
            )}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Integrations</h2>
          <p className={styles.cardMeta}>{tool.integrations.join(' · ')}</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Features</h2>
          <ul className={styles.cardMeta}>
            {tool.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Reviews</h2>
          {reviews.length === 0 ? (
            <p className={styles.cardMeta}>No reviews yet.</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className={styles.listItem}>
                <p className={styles.listItemTitle}>
                  {'★'.repeat(r.rating)} {r.title}
                </p>
                <p className={styles.cardMeta}>{r.comment}</p>
              </div>
            ))
          )}
        </section>

        {similar.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Similar Tools</h2>
            <div className={styles.grid}>
              {similar.map((t) => (
                <ToolCard key={t.id} tool={t} />
              ))}
            </div>
          </section>
        )}
      </div>

      <aside>
        <div className={styles.card}>
          <p className={styles.cardMeta}>
            ★ {tool.rating.toFixed(1)} ({tool.reviewCount} reviews)
          </p>
          <p className={styles.cardMeta}>{tool.installCount.toLocaleString()} installs</p>
          <p className={styles.cardMeta}>Credits: {tool.creditsRequired}</p>
          <p className={styles.cardMeta}>Provider: {tool.provider}</p>
          <p className={styles.cardMeta}>Latency: ~{tool.latencyMs}ms</p>
          {tool.estimatedCostPerRun !== undefined && (
            <p className={styles.cardMeta}>Est. cost/run: ${tool.estimatedCostPerRun.toFixed(2)}</p>
          )}
          <div className={styles.cardActions} style={{ flexDirection: 'column' }}>
            <Link href={tool.storeRoute} className={styles.btnPrimary}>
              Install → Store
            </Link>
            <Link href={tool.connectRoute} className={styles.btnSecondary}>
              Connect
            </Link>
            {tool.workspaceRoute && (
              <Link href={tool.workspaceRoute} className={styles.btnSecondary}>
                Run in AI-Pass
              </Link>
            )}
            {tool.apiDocsUrl && tool.apiAvailable && (
              <Link href={tool.apiDocsUrl} className={styles.btnSecondary}>
                API docs
              </Link>
            )}
            {tool.presenceAuditRoute && (
              <Link href={tool.presenceAuditRoute} className={styles.btnSecondary}>
                Presence Audit
              </Link>
            )}
            <Link
              href={`/discover/compare?a=${tool.id}&b=${similar[0]?.id ?? ''}`}
              className={styles.btnSecondary}
            >
              Compare
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
