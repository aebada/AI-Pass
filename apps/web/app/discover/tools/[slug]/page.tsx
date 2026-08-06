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

  hub.analytics.track({ type: 'view', resourceType: 'tool', resourceId: tool.id });

  return (
    <div className={styles.detailGrid}>
      <div>
        <h1 className={styles.heroTitle}>{tool.name}</h1>
        <p className={styles.heroSub}>{tool.description}</p>

        <div className={styles.badges} style={{ margin: '1rem 0' }}>
          {tool.trustBadges.map((b) => (
            <span key={b} className={`${styles.badge} ${styles.badgeTrust}`}>{b}</span>
          ))}
          <span className={styles.badge}>Trust Score {tool.trustScore}/100</span>
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Features</h2>
          <ul className={styles.cardMeta}>
            {tool.features.map((f) => <li key={f}>{f}</li>)}
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Reviews</h2>
          {reviews.length === 0 ? (
            <p className={styles.cardMeta}>No reviews yet.</p>
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
          <p className={styles.cardMeta}>Wallet balance check at install</p>
          <div className={styles.cardActions} style={{ flexDirection: 'column' }}>
            <Link href={tool.storeRoute} className={styles.btnPrimary}>Install → Store</Link>
            {tool.workspaceRoute && (
              <Link href={tool.workspaceRoute} className={styles.btnSecondary}>Run in AI-Pass</Link>
            )}
            {tool.presenceAuditRoute && (
              <Link href={tool.presenceAuditRoute} className={styles.btnSecondary}>Presence Audit</Link>
            )}
            <Link href={`/discover/compare?a=${tool.id}&b=${similar[0]?.id ?? ''}`} className={styles.btnSecondary}>
              Compare
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
