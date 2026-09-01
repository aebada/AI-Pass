import type { Metadata } from 'next';
import Link from 'next/link';
import { getDiscoveryHub } from '@/src/lib/discovery-server';
import styles from '../discover.module.css';

export const metadata: Metadata = {
  title: 'Enterprise AI Catalog | AI Pass Discovery Hub',
  description: 'Approve, block, and govern AI tools — procurement, inventory reports, and policy-based catalogs.',
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function EnterpriseCatalogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const hub = getDiscoveryHub();
  const orgId = first(sp.org) ?? 'demo-org';
  const requestSlug = first(sp.request);
  const policy = hub.enterprise.getPolicy(orgId);
  const report = hub.enterprise.report(orgId);
  const approved = hub.enterprise.listApproved(orgId);

  const requested = requestSlug ? hub.discovery.getTool(requestSlug) : undefined;
  const access = requested ? hub.enterprise.isAllowed(orgId, requested) : undefined;

  return (
    <>
      <h1 className={styles.heroTitle}>Enterprise Catalog</h1>
      <p className={styles.heroSub}>
        Approve tools, block tools, define approved catalogs, manage AI procurement, track usage, and generate inventory reports.
      </p>

      {requested && (
        <section className={styles.section}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Approval request: {requested.name}</h2>
            <p className={styles.cardMeta}>
              Access: {access?.allowed ? 'Allowed' : `Not allowed — ${access?.reason}`}
            </p>
            <p className={styles.cardMeta}>
              Use the API <code>POST /api/v1/discovery/enterprise</code> with action approve|block (demo org: {orgId}).
            </p>
            <Link href={`/discover/tools/${requested.slug}`} className={styles.btnSecondary}>Back to profile</Link>
          </div>
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Policy ({orgId})</h2>
        <p className={styles.cardMeta}>
          Require approval: {policy.requireApproval ? 'yes' : 'no'} · Min trust: {policy.minTrustScore ?? '—'} ·
          Required compliance: {policy.requiredCompliance?.join(', ') ?? '—'}
        </p>
        <p className={styles.cardMeta}>
          Approved {report.approvedCount} · Blocked {report.blockedCount} · Pending {report.pendingCount}
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Approved tools</h2>
        <ul>
          {approved.map((t) => (
            <li key={t.id} className={styles.cardMeta}>
              <Link href={`/discover/tools/${t.slug}`}>{t.name}</Link> — Trust {t.trustScore}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>AI inventory report</h2>
        <div className={styles.card}>
          {report.inventory.slice(0, 15).map((row) => (
            <p key={row.toolId} className={styles.cardMeta}>
              {row.name} · {row.status} · Trust {row.trustScore}
            </p>
          ))}
        </div>
      </section>
    </>
  );
}
