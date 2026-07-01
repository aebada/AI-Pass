import { getDiscoveryHub } from '@/src/lib/discovery-server';
import { ToolCard } from '../../components/DiscoverComponents';
import styles from '../../discover.module.css';
export function generateStaticParams() {
  const hub = getDiscoveryHub();
  return hub.collections.list().map((c) => ({ slug: c.slug }));
}

export default async function CollectionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hub = getDiscoveryHub();
  const collection = hub.collections.get(slug);

  if (!collection) {
    return <p className={styles.heroSub}>Collection not found.</p>;
  }

  const tools = hub.collections.getTools(slug);

  return (
    <>
      <h1 className={styles.heroTitle}>{collection.name}</h1>
      <p className={styles.heroSub}>{collection.description}</p>
      <p className={styles.cardMeta}>Audience: {collection.audience}</p>
      <div className={styles.grid}>
        {tools.map((t) => <ToolCard key={t.id} tool={t} />)}
      </div>
    </>
  );
}
