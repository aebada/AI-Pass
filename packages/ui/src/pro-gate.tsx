import type { ReactNode } from 'react';
import { Badge } from './badge';
import { Button } from './button';
import { Card } from './card';

export type PlanTier = 'free' | 'pro' | 'enterprise';

const TIER_RANK: Record<PlanTier, number> = {
  free: 0,
  pro: 1,
  enterprise: 2,
};

export interface ProGateProps {
  children: ReactNode;
  requiredTier: PlanTier;
  currentTier?: PlanTier;
  featureName?: string;
  onUpgrade?: () => void;
  blur?: boolean;
}

export function hasTierAccess(current: PlanTier, required: PlanTier): boolean {
  return TIER_RANK[current] >= TIER_RANK[required];
}

export function ProGate({
  children,
  requiredTier,
  currentTier = 'free',
  featureName = 'This feature',
  onUpgrade,
  blur = true,
}: ProGateProps) {
  if (hasTierAccess(currentTier, requiredTier)) {
    return <>{children}</>;
  }

  const tierLabel = requiredTier === 'pro' ? 'Pro' : 'Enterprise';

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          filter: blur ? 'blur(4px)' : undefined,
          opacity: blur ? 0.45 : 0.6,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
        aria-hidden
      >
        {children}
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <Card variant="glass" padding="md" style={{ maxWidth: 320, textAlign: 'center' }}>
          <Badge variant={requiredTier === 'enterprise' ? 'enterprise' : 'pro'} style={{ marginBottom: 12 }}>
            {tierLabel} only
          </Badge>
          <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--ai-text-muted, #6b7280)', lineHeight: 1.5 }}>
            {featureName} requires an AI Pass {tierLabel} plan.
          </p>
          <Button variant="primary" size="sm" onClick={onUpgrade}>
            Upgrade to {tierLabel}
          </Button>
        </Card>
      </div>
    </div>
  );
}
