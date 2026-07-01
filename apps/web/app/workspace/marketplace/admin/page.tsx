import { Badge } from '@ai-pass/ui';
import { getMarketplace } from '@/src/lib/marketplace-server';
import styles from '../marketplace.module.css';

export default function MarketplaceAdminPage() {
  const mp = getMarketplace();
  const pendingSkills = mp.skills.list().filter((s) => s.lifecycleStatus === 'review');
  const campaigns = [
    ...mp.promotions.getFeatured().apps.slice(0, 3).map((a) => ({ type: 'featured', name: a.name })),
    ...mp.promotions.getEditorsPicks().map((a) => ({ type: 'editors_pick', name: a.name })),
  ];

  return (
    <div className={styles.marketplace}>
      <h1 className={styles.heroTitle}>Marketplace Admin Console</h1>
      <p className={styles.heroSub}>Security approval pipeline, promotions, and catalog moderation.</p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Security Review Queue</h2>
        {pendingSkills.length === 0 ? (
          <p className={styles.heroSub}>No skills awaiting review.</p>
        ) : (
          pendingSkills.map((skill) => {
            const review = mp.security.reviewSkill(skill);
            return (
              <div key={skill.id} className={styles.card}>
                <h3>{skill.name}</h3>
                <p>Risk: {review.riskLevel} · Approved: {review.approved ? 'Yes' : 'No'}</p>
                {review.aiSafety.flags.map((f) => (
                  <Badge key={f} variant="outline">{f}</Badge>
                ))}
              </div>
            );
          })
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Active Promotions</h2>
        <div className={styles.grid}>
          {campaigns.map((c, i) => (
            <div key={i} className={styles.card}>
              <Badge variant="pro">{c.type}</Badge>
              <h3>{c.name}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Platform Summary</h2>
        <pre style={{ fontSize: 12 }}>{JSON.stringify(mp.analytics.getPlatformSummary(), null, 2)}</pre>
      </section>
    </div>
  );
}
