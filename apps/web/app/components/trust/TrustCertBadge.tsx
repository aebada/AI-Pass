'use client';

import Link from 'next/link';
import { Badge } from '@ai-pass/ui';
import { getTrustSummaryForResource } from '@ai-pass/trust-engine';
import styles from './TrustCertBadge.module.css';

export interface TrustCertBadgeProps {
  resourceId: string;
  compact?: boolean;
}

export function TrustCertBadge({ resourceId, compact }: TrustCertBadgeProps) {
  const trust = getTrustSummaryForResource(resourceId);
  if (!trust?.certified && !trust?.trustScore) return null;

  return (
    <div className={compact ? styles.compact : styles.strip}>
      {trust.certified && (
        <Badge variant="success">AI-Pass Certified</Badge>
      )}
      {trust.certificationLevel && (
        <Badge variant="pro">{trust.certificationLevel.toUpperCase()}</Badge>
      )}
      {trust.trustScore != null && (
        <span className={styles.score}>Trust {trust.trustScore}</span>
      )}
      {trust.riskLevel && (
        <Badge variant={trust.riskLevel === 'high' || trust.riskLevel === 'critical' ? 'warning' : 'outline'}>
          Risk: {trust.riskLevel}
        </Badge>
      )}
      {trust.verificationUrl && (
        <Link href={trust.verificationUrl} className={styles.verifyLink}>
          Verify →
        </Link>
      )}
    </div>
  );
}

export function useTrustSummary(resourceId: string) {
  return getTrustSummaryForResource(resourceId);
}
