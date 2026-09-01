import type { Metadata } from 'next';
import Link from 'next/link';
import { getDiscoveryHub } from '@/src/lib/discovery-server';
import styles from '../discover.module.css';

export const metadata: Metadata = {
  title: 'AI Taxonomy | AI Pass Discovery Hub',
  description: 'Browse the enterprise AI taxonomy — Text & LLM, Coding, Image, Video, Audio, Business, Data & AI, and more.',
};

export default function TaxonomyPage() {
  const hub = getDiscoveryHub();
  const taxonomy = hub.discovery.getTaxonomy();
  const stats = hub.discovery.catalogStats();

  return (
    <>
      <h1 className={styles.heroTitle}>AI Tool Taxonomy</h1>
      <p className={styles.heroSub}>
        Structured catalog for {stats.totalTools} tools across {taxonomy.length} domains — built to scale toward{' '}
        {stats.targetCatalogSize.toLocaleString()}+ AI products.
      </p>
      <div className={styles.grid}>
        {taxonomy.map((node) => (
          <article key={node.id} className={styles.card}>
            <h2 className={styles.cardTitle}>
              <Link href={`/discover/taxonomy/${node.slug}`}>{node.label}</Link>
            </h2>
            <p className={styles.cardMeta}>{node.description}</p>
            <p className={styles.cardMeta}>{node.toolCount} tools</p>
            <p className={styles.cardMeta}>{node.subcategories.join(' · ')}</p>
          </article>
        ))}
      </div>
    </>
  );
}
