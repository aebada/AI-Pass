'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Badge, Button, Card } from '@ai-pass/ui';
import { STORE_ROUTES } from '@ai-pass/routes';
import { WorkspaceLayoutClient } from '../../../../components/workspace/WorkspaceLayoutClient';
import { useStorePlatform, installStoreApp } from '../../../../components/store/store-client';
import styles from '../../store.module.css';

export default function AppDetailClient() {
  const params = useParams();
  const id = params.id as string;
  const { store } = useStorePlatform();

  const detail = store.getAppDetail(id);
  if (!detail) {
    return (
      <WorkspaceLayoutClient title="App not found" subtitle="">
        <Badge variant="outline">No app found for &quot;{id}&quot;</Badge>
        <Link href={STORE_ROUTES.home} className={styles.navLink}>← Back to Store</Link>
      </WorkspaceLayoutClient>
    );
  }

  const reviews = store.listReviews(detail.id);
  const github = store.github.getMetadata(detail);
  const installed = store.installations.listInstalled('default').some((i) => i.appId === detail.id);

  return (
    <WorkspaceLayoutClient title={detail.name} subtitle={detail.description}>
      <Link href={STORE_ROUTES.home} className={styles.navLink}>← Store Home</Link>
      <div className={styles.detailGrid} style={{ marginTop: 16 }}>
        <div className={styles.detailMain}>
          <Card padding="lg">
            <div className={styles.badges}>
              {detail.certified && <Badge variant="success">Certified</Badge>}
              {detail.enterpriseReady && <Badge variant="pro">Enterprise Ready</Badge>}
              {detail.openSource && <Badge variant="outline">Open Source</Badge>}
              <Badge variant="outline">Trust {detail.trustScore}</Badge>
              <Badge variant="outline">{detail.pricingModel.replace('_', ' ')}</Badge>
            </div>
            <p style={{ marginTop: 16, lineHeight: 1.6 }}>{detail.description}</p>
            <p className={styles.cardMeta}>
              ★ {detail.rating.toFixed(1)} ({detail.reviewCount} reviews) · {detail.installCount.toLocaleString()} installs · v{detail.version}
            </p>
            <p className={styles.cardMeta}>Membership: {detail.membershipRequired} · Models: {detail.modelsUsed.join(', ')}</p>
          </Card>

          <Card padding="lg">
            <h3 className={styles.sectionTitle}>Features & Permissions</h3>
            <div className={styles.badges}>
              {detail.tags.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
            </div>
            <ul style={{ marginTop: 12, fontSize: 13 }}>
              {detail.permissionsDetail.map((p) => (
                <li key={p.id}>{p.label} - {p.description}</li>
              ))}
            </ul>
          </Card>

          {github && (
            <Card padding="lg">
              <h3 className={styles.sectionTitle}>GitHub App</h3>
              <p className={styles.cardDesc}>{github.readmeExcerpt}</p>
              <p className={styles.cardMeta}>Repo: {github.repoUrl} · Sync: {github.syncStatus}</p>
            </Card>
          )}

          <Card padding="lg">
            <h3 className={styles.sectionTitle}>Reviews</h3>
            {reviews.length === 0 ? (
              <p className={styles.cardMeta}>No reviews yet.</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className={styles.review}>
                  <p className={styles.reviewTitle}>{'★'.repeat(r.rating)} {r.title}</p>
                  <p className={styles.reviewComment}>{r.comment}</p>
                </div>
              ))
            )}
          </Card>
        </div>

        <div className={styles.detailSidebar}>
          <Card padding="md">
            {installed ? (
              <Link href={detail.workspaceRoute}>
                <Button variant="primary" style={{ width: '100%' }}>Open in Workspace →</Button>
              </Link>
            ) : (
              <Button variant="primary" onClick={() => installStoreApp(detail.id)} style={{ width: '100%' }}>
                Install App
              </Button>
            )}
            {detail.priceMonthly && (
              <p className={styles.cardMeta} style={{ marginTop: 12 }}>${detail.priceMonthly}/month</p>
            )}
            {detail.creditsPerUse && (
              <p className={styles.cardMeta}>${detail.creditsPerUse} per use</p>
            )}
          </Card>
          <Card padding="md">
            <h4 className={styles.sectionTitle}>Versions</h4>
            {detail.versions.map((v) => (
              <p key={v.id} className={styles.cardMeta}>v{v.version} - {v.status}</p>
            ))}
          </Card>
          <Card padding="md">
            <h4 className={styles.sectionTitle}>Docs</h4>
            <a href={detail.docsUrl} className={styles.navLink} target="_blank" rel="noreferrer">View documentation</a>
          </Card>
        </div>
      </div>
    </WorkspaceLayoutClient>
  );
}
