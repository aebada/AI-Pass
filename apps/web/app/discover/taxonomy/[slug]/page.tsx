import type { Metadata } from 'next';
import { getDiscoveryHub } from '@/src/lib/discovery-server';
import { getTaxonomyBySlug } from '@ai-pass/discovery-hub';
import { ToolCard } from '../../components/DiscoverComponents';
import styles from '../../discover.module.css';

export function generateStaticParams() {
  const hub = getDiscoveryHub();
  return hub.discovery.getTaxonomy().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const node = getTaxonomyBySlug(slug);
  return {
    title: node ? `${node.label} AI Tools | Discovery Hub` : 'Taxonomy | Discovery Hub',
    description: node?.description,
  };
}

export default async function TaxonomyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hub = getDiscoveryHub();
  const node = getTaxonomyBySlug(slug);
  const tools = hub.discovery.listByTaxonomy(slug);

  if (!node) {
    return <p className={styles.heroSub}>Taxonomy not found.</p>;
  }

  return (
    <>
      <p className={styles.eyebrow}>Taxonomy</p>
      <h1 className={styles.heroTitle}>{node.label}</h1>
      <p className={styles.heroSub}>{node.description}</p>
      <p className={styles.cardMeta}>Subcategories: {node.subcategories.join(' · ')}</p>
      <div className={styles.grid}>
        {tools.map((t) => (
          <ToolCard key={t.id} tool={t} />
        ))}
      </div>
      {tools.length === 0 && <p className={styles.cardMeta}>No tools indexed in this taxonomy yet.</p>}
    </>
  );
}
