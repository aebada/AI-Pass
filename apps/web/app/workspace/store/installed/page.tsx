'use client';

import Link from 'next/link';
import { STORE_ROUTES, appWorkspaceRoute } from '@ai-pass/routes';
import { Badge, Button, Card } from '@ai-pass/ui';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { getInstalledApps, useStorePlatform, DEMO_TENANT } from '../../../components/store/store-client';
import styles from '../store.module.css';

export default function InstalledAppsPage() {
  const { store } = useStorePlatform();
  const apps = getInstalledApps();
  const installs = store.installations.listInstalled(DEMO_TENANT);

  return (
    <WorkspaceLayoutClient title="Installed Apps" subtitle="Apps active in your workspace">
      <Link href={STORE_ROUTES.home} className={styles.navLink}>← Store Home</Link>
      <div className={styles.grid} style={{ marginTop: 16 }}>
        {apps.map((app) => {
          const inst = installs.find((i) => i.appId === app.id);
          return (
            <Card key={app.id} padding="md" className={styles.card}>
              <h3 className={styles.cardTitle}>{app.name}</h3>
              <p className={styles.cardDesc}>{app.description.slice(0, 100)}…</p>
              <Badge variant="success">Active</Badge>
              <p className={styles.cardMeta}>Installed {inst?.installedAt?.slice(0, 10)}</p>
              <Link href={appWorkspaceRoute(app.slug)}>
                <Button variant="primary" size="sm">Open →</Button>
              </Link>
            </Card>
          );
        })}
      </div>
    </WorkspaceLayoutClient>
  );
}
