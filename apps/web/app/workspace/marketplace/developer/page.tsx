import Link from 'next/link';
import { Badge } from '@ai-pass/ui';
import { getMarketplace } from '@/src/lib/marketplace-server';
import styles from '../marketplace.module.css';

export default function DeveloperPortalPage() {
  const mp = getMarketplace();
  const dashboard = mp.developerPortal.getDashboard('dev_ai_pass');
  const developers = mp.developers.list();

  if (!dashboard) {
    return <p>Developer not found</p>;
  }

  const { profile, apiKeys, payouts, revenueShare } = dashboard;

  return (
    <div className={styles.marketplace}>
      <h1 className={styles.heroTitle}>Developer Portal</h1>
      <p className={styles.heroSub}>Register, verify, manage API keys, sandbox, and payouts (70/30 revenue share).</p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{profile.name}</h2>
        <p>{profile.bio}</p>
        <div className={styles.badges}>
          {profile.badges.map((b) => (
            <Badge key={b.type} variant="success">{b.label}</Badge>
          ))}
          <span className={styles.cardMeta}>{profile.appCount} apps · {profile.skillCount} skills</span>
          <span className={styles.cardMeta}>Reputation: {profile.reputationScore}</span>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>API Keys & Sandbox</h2>
        {apiKeys.length === 0 ? (
          <p className={styles.heroSub}>No API keys yet. Create one via POST /api/v1/marketplace/developers</p>
        ) : (
          <table className={styles.table}>
            <thead><tr><th>Label</th><th>Prefix</th><th>Sandbox</th></tr></thead>
            <tbody>
              {apiKeys.map((k) => (
                <tr key={k.id}><td>{k.label}</td><td>{k.keyPrefix}…</td><td>{k.sandbox ? 'Yes' : 'No'}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Revenue Share</h2>
        <p className={styles.cardMeta}>
          Developer: {(revenueShare.developerShare * 100).toFixed(0)}% · Platform: {(revenueShare.platformFee * 100).toFixed(0)}%
        </p>
        {payouts.length > 0 && (
          <table className={styles.table}>
            <thead><tr><th>Period</th><th>Gross</th><th>Net</th><th>Status</th></tr></thead>
            <tbody>
              {payouts.map((p, i) => (
                <tr key={i}><td>{p.period}</td><td>${p.grossRevenue}</td><td>${p.netPayout.toFixed(2)}</td><td>{p.status}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Top Developers</h2>
        <div className={styles.grid}>
          {developers.map((d) => (
            <div key={d.id} className={styles.card}>
              <h3 className={styles.cardTitle}>{d.name}</h3>
              <p className={styles.cardMeta}>★ {d.reputationScore} · {d.appCount} apps</p>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.navLinks}>
        <Link href="/workspace/marketplace/publish/app">Publish App</Link>
        <Link href="/workspace/marketplace/publish/skill">Publish Skill</Link>
        <Link href="/workspace/marketplace/analytics">Analytics</Link>
      </div>
    </div>
  );
}
