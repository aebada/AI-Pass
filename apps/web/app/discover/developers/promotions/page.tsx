import Link from 'next/link';
import { getDiscoveryHub } from '@/src/lib/discovery-server';
import { DealCard } from '../../components/DiscoverComponents';
import styles from '../../discover.module.css';

export default function DeveloperPromotionsPage() {
  const hub = getDiscoveryHub();
  const developers = hub.marketplace.developers.getTop();
  const deals = hub.deals.list().filter((d) => d.dealType === 'campaign' || d.dealType === 'limited_time');

  return (
    <>
      <h1 className={styles.heroTitle}>Developer Promotions</h1>
      <p className={styles.heroSub}>Featured developers and active promotion campaigns.</p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Top Developers</h2>
        <div className={styles.grid}>
          {developers.map((dev) => (
            <article key={dev.id} className={styles.card}>
              <h3 className={styles.cardTitle}>{dev.name}</h3>
              <p className={styles.cardMeta}>{dev.bio?.slice(0, 100)}…</p>
              <p className={styles.cardMeta}>
                {dev.appCount} apps · ★ {dev.reputationScore} · ${dev.totalRevenue.toLocaleString()} revenue
              </p>
              <Link href={`/discover/search?developerId=${dev.id}`} className={styles.btnSecondary}>
                View apps
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Active Campaigns</h2>
        <div className={styles.grid}>
          {deals.map((d) => <DealCard key={d.id} deal={d} />)}
        </div>
      </section>
    </>
  );
}
