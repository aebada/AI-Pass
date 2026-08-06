'use client';

import { useParams } from 'next/navigation';
import { TrustCertBadge } from '../../../../components/trust/TrustCertBadge';
import { Badge, Button, Card } from '@ai-pass/ui';
import { WorkspaceLayoutClient } from '../../../../components/workspace/WorkspaceLayoutClient';
import { useMarketplacePlatform, installApp } from '../../../../components/marketplace/marketplace-client';
import styles from '../../marketplace.module.css';

export default function AppDetailClient() {
  const params = useParams();
  const slug = params.slug as string;
  const platform = useMarketplacePlatform();

  const app = platform.apps.get(slug) ?? platform.apps.getBySlug(slug);
  if (!app) {
    return (
      <WorkspaceLayoutClient title="App not found" subtitle="">
        <Badge variant="outline">No app found for &quot;{slug}&quot;</Badge>
      </WorkspaceLayoutClient>
    );
  }

  const reviews = platform.reviews.listForResource(app.id);
  const certs = platform.certifications.listForResource('app', app.id);
  const skills = app.skillIds.map((sid) => platform.skills.get(sid)).filter(Boolean);
  const developer = platform.developers.get(app.developerId);

  return (
    <WorkspaceLayoutClient title={app.name} subtitle={app.description}>
      <div className={styles.detailGrid}>
        <div className={styles.detailMain}>
          <Card padding="lg">
            <div className={styles.badges}>
              {app.certified && <Badge variant="success">Certified</Badge>}
              {app.enterpriseReady && <Badge variant="pro">Enterprise Ready</Badge>}
              {app.openSource && <Badge variant="outline">Open Source</Badge>}
              <Badge variant="outline">{app.pricingModel.replace('_', ' ')}</Badge>
              <Badge variant="outline">{app.category.replace('_', ' ')}</Badge>
            </div>
            <p style={{ marginTop: 16, lineHeight: 1.6 }}>{app.description}</p>
            <TrustCertBadge resourceId={app.slug} />
            <p className={styles.cardMeta}>
              ★ {app.rating.toFixed(1)} ({app.reviewCount} reviews) · {app.installCount.toLocaleString()} installs · v{app.version}
            </p>
          </Card>

          {skills.length > 0 && (
            <Card padding="lg">
              <h3 className={styles.sectionTitle}>Included Skills</h3>
              <div className={styles.badges}>
                {skills.map((s) => s && (
                  <Badge key={s.id} variant="outline">{s.name}</Badge>
                ))}
              </div>
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
            <Button variant="primary" onClick={() => installApp(app.id)} style={{ width: '100%' }}>
              Install App
            </Button>
            {app.priceMonthly && (
              <p className={styles.cardMeta} style={{ marginTop: 12 }}>
                ${app.priceMonthly}/month
              </p>
            )}
          </Card>

          {developer && (
            <Card padding="md">
              <h4 className={styles.cardTitle}>Developer</h4>
              <p>{developer.name}</p>
              {developer.verified && <Badge variant="success">Verified</Badge>}
            </Card>
          )}

          {certs.length > 0 && (
            <Card padding="md">
              <h4 className={styles.cardTitle}>Trust Badges</h4>
              {certs.map((c) => (
                <Badge key={c.id} variant="success">{c.level} certified</Badge>
              ))}
            </Card>
          )}
        </div>
      </div>
    </WorkspaceLayoutClient>
  );
}
