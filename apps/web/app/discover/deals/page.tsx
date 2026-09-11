import type { Metadata } from 'next';
import { getDiscoveryHub } from '@/src/lib/discovery-server';
import { DealCard } from '../components/DiscoverComponents';
import styles from '../discover.module.css';

export const metadata: Metadata = {
  title: 'AI Deals Hub - Lifetime Deals & Discounts | AI Pass',
  description: 'Limited-time AI tool deals, bundles, enterprise packages, and lifetime offers.',
};

export default function DealsHubPage() {
  const hub = getDiscoveryHub();
  const deals = hub.deals.list();

  return (
    <>
      <h1 className={styles.heroTitle}>Deals Hub</h1>
      <p className={styles.heroSub}>Lifetime deals, discounts, bundles, enterprise packages, and limited-time promos.</p>
      <div className={styles.grid}>
        {deals.map((d) => <DealCard key={d.id} deal={d} />)}
      </div>
    </>
  );
}
