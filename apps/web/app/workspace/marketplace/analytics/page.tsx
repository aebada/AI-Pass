import { getMarketplace } from '@/src/lib/marketplace-server';
import styles from '../marketplace.module.css';

export default function MarketplaceAnalyticsPage() {
  const mp = getMarketplace();
  const summary = mp.analytics.getPlatformSummary();
  const devAnalytics = mp.analytics.getDeveloperAnalytics('dev_ai_pass');

  return (
    <div className={styles.marketplace}>
      <h1 className={styles.heroTitle}>Marketplace Analytics</h1>
      <p className={styles.heroSub}>Installs, active users, revenue, credits, execution, latency, and retention.</p>

      <div className={styles.statGrid}>
        <div className={styles.stat}><span className={styles.statValue}>{summary.totalInstalls.toLocaleString()}</span><span className={styles.statLabel}>Total installs</span></div>
        <div className={styles.stat}><span className={styles.statValue}>${summary.totalRevenue.toFixed(0)}</span><span className={styles.statLabel}>Revenue</span></div>
        <div className={styles.stat}><span className={styles.statValue}>{summary.totalCredits.toLocaleString()}</span><span className={styles.statLabel}>Credits consumed</span></div>
        <div className={styles.stat}><span className={styles.statValue}>{(summary.avgRetention * 100).toFixed(0)}%</span><span className={styles.statLabel}>Avg retention</span></div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Developer Metrics (AI Pass Labs)</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Resource</th>
              <th>Installs</th>
              <th>Active</th>
              <th>Invocations</th>
              <th>Credits</th>
              <th>Latency</th>
              <th>Crashes</th>
            </tr>
          </thead>
          <tbody>
            {devAnalytics.slice(0, 12).map((a) => (
              <tr key={a.resourceId}>
                <td>{a.resourceId}</td>
                <td>{a.installs}</td>
                <td>{a.activeUsers}</td>
                <td>{a.invocations}</td>
                <td>{a.creditsConsumed}</td>
                <td>{a.avgLatencyMs}ms</td>
                <td>{a.crashes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
