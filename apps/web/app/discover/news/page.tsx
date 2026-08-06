import { getDiscoveryHub } from '@/src/lib/discovery-server';
import { NewsItem } from '../components/DiscoverComponents';
import styles from '../discover.module.css';

export default function NewsPage() {
  const hub = getDiscoveryHub();
  const articles = hub.news.list();

  return (
    <>
      <h1 className={styles.heroTitle}>AI News</h1>
      <p className={styles.heroSub}>Product launches, LLM updates, marketplace news, and events.</p>
      {articles.map((a) => <NewsItem key={a.id} article={a} />)}
    </>
  );
}
