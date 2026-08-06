import type { Metadata } from 'next';
import { MARKETPLACE_CATEGORIES } from '@ai-pass/marketplace-core';
import { getDiscoveryHub } from '@/src/lib/discovery-server';
import { ToolCard } from '../../components/DiscoverComponents';
import styles from '../../discover.module.css';

export function generateStaticParams() {
  return MARKETPLACE_CATEGORIES.map((cat) => ({ slug: cat.replace(/_/g, '-') }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const hub = getDiscoveryHub();
  const cat = hub.discovery.getCategories().find((c) => c.slug === slug);
  if (!cat) return { title: 'Category | AI Pass Discovery' };
  const seo = hub.seo.forCategory(cat);
  return { title: seo.title, description: seo.description, keywords: seo.keywords };
}

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hub = getDiscoveryHub();
  const cat = hub.discovery.getCategories().find((c) => c.slug === slug);

  if (!cat) {
    return <p className={styles.heroSub}>Category not found.</p>;
  }

  const tools = hub.search.searchByCategory(cat.id);

  return (
    <>
      <h1 className={styles.heroTitle}>{cat.label}</h1>
      <p className={styles.heroSub}>{cat.description}</p>
      <div className={styles.grid}>
        {tools.map((t) => <ToolCard key={t.id} tool={t} />)}
      </div>
    </>
  );
}
