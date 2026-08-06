import { getDiscoveryHub } from '@/src/lib/discovery-server';
import { ToolCard } from '../components/DiscoverComponents';
import styles from '../discover.module.css';

export default function TrendingPage() {
  const hub = getDiscoveryHub();
  const scores = hub.trending.getTrendingScores();
  const tools = hub.trending.getTrendingTools();

  return (
    <>
      <h1 className={styles.heroTitle}>Trending AI Tools</h1>
      <p className={styles.heroSub}>Ranked by downloads, installs, usage, ratings, growth, engagement, and trust score.</p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Trending Scores</h2>
        <table className={styles.compareTable}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Tool</th>
              <th>Score</th>
              <th>Installs</th>
              <th>Growth</th>
              <th>Trust</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((s) => {
              const tool = hub.discovery.getTool(s.toolId);
              return (
                <tr key={s.toolId}>
                  <td>#{s.rank}</td>
                  <td>{tool?.name ?? s.toolId}</td>
                  <td>{s.score}</td>
                  <td>{s.installs.toLocaleString()}</td>
                  <td>{s.growth.toFixed(1)}%</td>
                  <td>{s.trustScore}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <div className={styles.grid}>
        {tools.map((t) => <ToolCard key={t.id} tool={t} />)}
      </div>
    </>
  );
}
