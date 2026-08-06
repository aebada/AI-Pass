import { Badge, Button } from '@ai-pass/ui';
import { getMarketplace } from '@/src/lib/marketplace-server';
import styles from '../marketplace.module.css';

const ORG_ID = 'org_demo';

export default function EnterpriseMarketplacePage() {
  const mp = getMarketplace();
  const policy = mp.enterprise.getOrCreatePolicy(ORG_ID);
  const allApps = mp.apps.list();
  const filtered = mp.enterprise.filterAppsForOrg(ORG_ID, allApps, mp.apps);

  return (
    <div className={styles.marketplace}>
      <h1 className={styles.heroTitle}>Enterprise Private Marketplace</h1>
      <p className={styles.heroSub}>
        Private store, version approval, model restrictions, and internal publishing for your organization.
      </p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Policy</h2>
        <div className={styles.detailMeta}>
          <Badge variant={policy.privateStoreEnabled ? 'success' : 'outline'}>Private store</Badge>
          <Badge variant={policy.requireApproval ? 'pro' : 'outline'}>Approval required</Badge>
          <span>Approved: {policy.approvedAppIds.length}</span>
          <span>Pending: {policy.pendingAppIds.length}</span>
          <span>Blocked models: {policy.blockedModels.join(', ') || 'none'}</span>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Approved Apps ({filtered.length})</h2>
        <div className={styles.grid}>
          {filtered.map((app) => (
            <div key={app.id} className={styles.card}>
              <h3>{app.name}</h3>
              <p className={styles.cardDesc}>{app.description.slice(0, 100)}…</p>
              {policy.approvedAppIds.includes(app.id) && <Badge variant="success">Approved</Badge>}
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Pending Approval</h2>
        {policy.pendingAppIds.length === 0 ? (
          <p className={styles.heroSub}>No apps pending approval.</p>
        ) : (
          policy.pendingAppIds.map((id) => {
            const app = mp.apps.get(id);
            return app ? (
              <div key={id} className={styles.card}>
                <h3>{app.name}</h3>
                <Button variant="primary">Approve v{app.version}</Button>
              </div>
            ) : null;
          })
        )}
      </section>
    </div>
  );
}
