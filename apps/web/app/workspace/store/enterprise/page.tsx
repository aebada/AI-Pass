import Link from 'next/link';
import { STORE_ROUTES } from '@ai-pass/routes';
import { Badge } from '@ai-pass/ui';
import { getStore } from '@/src/lib/store-server';
import styles from '../store.module.css';

const ORG_ID = 'org_demo';

export default function EnterpriseStorePage() {
  const store = getStore();
  const policy = store.enterprise.getPolicy(ORG_ID);
  const catalog = store.enterprise.getCatalog(ORG_ID);
  const apps = store.enterprise.filterApps(ORG_ID, store.apps.list());

  return (
    <div className={styles.marketplace} style={{ padding: 24 }}>
      <h1 className={styles.heroTitle}>Enterprise AI App Store Admin</h1>
      <p className={styles.heroSub}>
        Private catalogs for Government, Defence, and air-gapped estates — approve installs, lock versions,
        disable public apps, and ship only compliance-cleared agents, packs, workflows, and plugins.
      </p>
      <Link href={STORE_ROUTES.home} className={styles.navLink}>← Store Home</Link>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Policy</h2>
        <div className={styles.detailMeta}>
          <Badge variant={catalog.privateOnly ? 'success' : 'outline'}>Private catalog</Badge>
          <Badge variant={policy.requireApproval ? 'pro' : 'outline'}>Approval required</Badge>
          <Badge variant={catalog.publicAppsDisabled ? 'default' : 'outline'}>Public apps disabled</Badge>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Catalog ({apps.length} apps)</h2>
        <div className={styles.grid}>
          {apps.slice(0, 8).map((app) => (
            <div key={app.id} className={styles.card}>
              <h3>{app.name}</h3>
              <p className={styles.cardDesc}>{app.description.slice(0, 80)}…</p>
              {policy.approvedAppIds.includes(app.id) && <Badge variant="success">Approved</Badge>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
