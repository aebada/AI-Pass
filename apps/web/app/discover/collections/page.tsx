import Link from 'next/link';
import { getDiscoveryHub } from '@/src/lib/discovery-server';
import { CollectionCard } from '../components/DiscoverComponents';
import styles from '../discover.module.css';

export default function CollectionsPage() {
  const hub = getDiscoveryHub();
  const collections = hub.collections.list();

  return (
    <>
      <h1 className={styles.heroTitle}>Curated Collections</h1>
      <p className={styles.heroSub}>Editorial lists for startups, enterprise, developers, and industry verticals.</p>
      <div className={styles.grid}>
        {collections.map((c) => <CollectionCard key={c.id} collection={c} />)}
      </div>
    </>
  );
}
