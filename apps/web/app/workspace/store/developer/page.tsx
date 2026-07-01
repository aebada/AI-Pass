'use client';

import Link from 'next/link';
import { STORE_ROUTES } from '@ai-pass/routes';
import { Badge, Card } from '@ai-pass/ui';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { useStorePlatform } from '../../../components/store/store-client';
import styles from '../store.module.css';

export default function StoreDeveloperPage() {
  const { store } = useStorePlatform();
  const devId = 'dev_ai_pass';
  const data = store.getDeveloper(devId);

  if (!data) {
    return (
      <WorkspaceLayoutClient title="Developer" subtitle="">
        <p>Developer not found</p>
      </WorkspaceLayoutClient>
    );
  }

  const { developer, dashboard } = data;

  return (
    <WorkspaceLayoutClient title="Developer Dashboard" subtitle={developer.name}>
      <Link href={STORE_ROUTES.home} className={styles.navLink}>← Store Home</Link>
      <div className={styles.statGrid} style={{ marginTop: 16 }}>
        <div className={styles.stat}><span className={styles.statValue}>{developer.appCount}</span><span className={styles.statLabel}>Apps</span></div>
        <div className={styles.stat}><span className={styles.statValue}>{developer.skillCount}</span><span className={styles.statLabel}>Skills</span></div>
        <div className={styles.stat}><span className={styles.statValue}>${developer.totalRevenue.toLocaleString()}</span><span className={styles.statLabel}>Revenue</span></div>
        <div className={styles.stat}><span className={styles.statValue}>{developer.reputationScore}</span><span className={styles.statLabel}>Reputation</span></div>
      </div>
      {dashboard && (
        <Card padding="lg" style={{ marginTop: 16 }}>
          <h3 className={styles.sectionTitle}>Analytics</h3>
          <p className={styles.cardMeta}>
            Revenue share: {(dashboard.revenueShare.developerShare * 100).toFixed(0)}/
            {(dashboard.revenueShare.platformFee * 100).toFixed(0)} · API keys: {dashboard.apiKeys.length}
          </p>
        </Card>
      )}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Published Apps</h2>
        <div className={styles.grid}>
          {data.apps.map((app) => (
            <Card key={app.id} padding="md">
              <h3>{app.name}</h3>
              {app.certified && <Badge variant="success">Certified</Badge>}
              <Link href={STORE_ROUTES.app(app.slug)} className={styles.navLink}>View →</Link>
            </Card>
          ))}
        </div>
      </section>
      <Link href={STORE_ROUTES.submit} className={styles.navLink}>Publish new app →</Link>
    </WorkspaceLayoutClient>
  );
}
