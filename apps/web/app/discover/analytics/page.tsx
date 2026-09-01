import type { Metadata } from 'next';
import { getDiscoveryHub } from '@/src/lib/discovery-server';
import { ToolSection } from '../components/DiscoverComponents';
import styles from '../discover.module.css';

export const metadata: Metadata = {
  title: 'Discovery Analytics | AI Pass Discovery Hub',
  description: 'Trending tools, most installed, fastest growing, highest trust score, new releases, and enterprise adoption.',
};

export default function DiscoveryAnalyticsPage() {
  const hub = getDiscoveryHub();
  const tools = hub.discovery.listTools();
  const dashboard = hub.analytics.dashboard(tools);
  const stats = hub.discovery.catalogStats();
  const summary = hub.analytics.summary();

  return (
    <>
      <h1 className={styles.heroTitle}>Discovery Analytics</h1>
      <p className={styles.heroSub}>
        Catalog {stats.totalTools} tools ({stats.marketplaceTools} marketplace · {stats.externalTools} external). Events:
        {summary.views} views · {summary.searches} searches · {summary.installs} installs.
      </p>

      <ToolSection title="Trending" tools={dashboard.trending} />
      <ToolSection title="Most Installed" tools={dashboard.mostInstalled} />
      <ToolSection title="Most Used" tools={dashboard.mostUsed} />
      <ToolSection title="Fastest Growing" tools={dashboard.fastestGrowing} />
      <ToolSection title="Highest Trust Score" tools={dashboard.highestTrust} />
      <ToolSection title="New Releases" tools={dashboard.newReleases} />
      <ToolSection title="Enterprise Adoption" tools={dashboard.enterpriseAdoption} />
    </>
  );
}
