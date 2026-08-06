'use client';

import { useParams } from 'next/navigation';
import { Badge, Card } from '@ai-pass/ui';
import { WorkspaceLayoutClient } from '../../../../components/workspace/WorkspaceLayoutClient';
import { useMarketplacePlatform } from '../../../../components/marketplace/marketplace-client';
import styles from '../../marketplace.module.css';

export default function SkillDetailClient() {
  const params = useParams();
  const slug = params.slug as string;
  const platform = useMarketplacePlatform();

  const skill = platform.skills.get(slug) ?? platform.skills.getBySlug(slug);
  if (!skill) {
    return (
      <WorkspaceLayoutClient title="Skill not found" subtitle="">
        <Badge variant="outline">No skill found for &quot;{slug}&quot;</Badge>
      </WorkspaceLayoutClient>
    );
  }

  const reviews = platform.reviews.listForResource(skill.id);
  const estimate = platform.lifecycle.estimateCredits(skill.id, { sample: true });

  return (
    <WorkspaceLayoutClient title={skill.name} subtitle={skill.description}>
      <div className={styles.detailGrid}>
        <div className={styles.detailMain}>
          <Card padding="lg">
            <div className={styles.badges}>
              <Badge variant="outline">{skill.category}</Badge>
              {skill.certified && <Badge variant="success">Certified</Badge>}
              <Badge variant="outline">{skill.creditCost} credits/run</Badge>
              <Badge variant="outline">Tier: {skill.planTierRequired}</Badge>
            </div>
            <p style={{ marginTop: 16, lineHeight: 1.6 }}>{skill.description}</p>
            <p className={styles.cardMeta}>
              v{skill.version} · ★ {skill.rating.toFixed(1)} · {skill.installCount} installs
            </p>
          </Card>

          <Card padding="lg">
            <h3 className={styles.sectionTitle}>Reviews</h3>
            {reviews.map((r) => (
              <div key={r.id} className={styles.review}>
                <p className={styles.reviewTitle}>{'★'.repeat(r.rating)}</p>
                <p className={styles.reviewComment}>{r.comment}</p>
              </div>
            ))}
          </Card>
        </div>

        <div className={styles.detailSidebar}>
          <Card padding="md">
            <h4 className={styles.cardTitle}>Credit Estimate</h4>
            <p className={styles.statValue}>{estimate}</p>
            <p className={styles.statLabel}>credits per invocation</p>
          </Card>
          <Card padding="md">
            <h4 className={styles.cardTitle}>Models</h4>
            <div className={styles.badges}>
              {skill.modelsUsed.map((m) => (
                <Badge key={m} variant="outline">{m}</Badge>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </WorkspaceLayoutClient>
  );
}
