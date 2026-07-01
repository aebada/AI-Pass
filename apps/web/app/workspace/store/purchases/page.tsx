'use client';

import Link from 'next/link';
import { STORE_ROUTES } from '@ai-pass/routes';
import { Card } from '@ai-pass/ui';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { useStorePlatform, DEMO_TENANT } from '../../../components/store/store-client';
import styles from '../store.module.css';

export default function PurchasesPage() {
  const { store } = useStorePlatform();
  const subs = store.installations.getSubscriptions(DEMO_TENANT);

  return (
    <WorkspaceLayoutClient title="My Purchases" subtitle="Subscriptions and billing history">
      <Link href={STORE_ROUTES.home} className={styles.navLink}>← Store Home</Link>
      <div className={styles.grid} style={{ marginTop: 16 }}>
        {subs.length === 0 ? (
          <p className={styles.cardMeta}>No active subscriptions. Install a paid app from the Store.</p>
        ) : (
          subs.map((sub) => {
            const app = store.apps.get(sub.appId);
            return (
              <Card key={sub.id} padding="md">
                <h3>{app?.name ?? sub.appId}</h3>
                <p className={styles.cardMeta}>Plan: {sub.planTier} · Status: {sub.status}</p>
                <p className={styles.cardMeta}>Renews: {sub.renewsAt?.slice(0, 10)}</p>
              </Card>
            );
          })
        )}
      </div>
    </WorkspaceLayoutClient>
  );
}
