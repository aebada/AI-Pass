import Link from 'next/link';
import { getDiscoveryHub } from '@/src/lib/discovery-server';
import styles from '../discover.module.css';

export default function CategoriesPage() {
  const hub = getDiscoveryHub();
  const categories = hub.discovery.getCategories().filter((c) => c.toolCount > 0);

  return (
    <>
      <h1 className={styles.heroTitle}>Categories</h1>
      <p className={styles.heroSub}>Browse {categories.length}+ AI tool categories</p>
      <div className={styles.grid}>
        {categories.map((cat) => (
          <Link key={cat.id} href={`/discover/categories/${cat.slug}`} className={styles.card}>
            <h3 className={styles.cardTitle}>{cat.label}</h3>
            <p className={styles.cardMeta}>{cat.description}</p>
            <p className={styles.cardMeta}>{cat.toolCount} tools</p>
          </Link>
        ))}
      </div>
    </>
  );
}
