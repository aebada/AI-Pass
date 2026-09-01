import { Suspense } from 'react';
import { getDiscoveryHub } from '@/src/lib/discovery-server';
import { DiscoverSearchClient } from '../components/DiscoverSearchClient';
import styles from '../discover.module.css';

export default function SearchPage() {
  const hub = getDiscoveryHub();
  const result = hub.search.search({}, 1, 200);
  hub.analytics.track({ type: 'view', resourceType: 'page', resourceId: 'discover-search' });

  return (
    <Suspense fallback={<p className={styles.heroSub}>Loading search…</p>}>
      <DiscoverSearchClient tools={result.tools} catalogTotal={result.total} />
    </Suspense>
  );
}
