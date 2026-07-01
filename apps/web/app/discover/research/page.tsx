import { getDiscoveryHub } from '@/src/lib/discovery-server';
import { ResearchItem } from '../components/DiscoverComponents';
import styles from '../discover.module.css';

export default function ResearchPage() {
  const hub = getDiscoveryHub();
  const articles = hub.research.list();

  return (
    <>
      <h1 className={styles.heroTitle}>AI Research</h1>
      <p className={styles.heroSub}>Papers, benchmarks, and industry reports.</p>
      {articles.map((a) => <ResearchItem key={a.id} article={a} />)}
    </>
  );
}
