'use client';

import Link from 'next/link';
import { getTrustEngine } from '@ai-pass/trust-engine';
import type { CertificationLevel } from '@ai-pass/shared';
import { Badge, Button, Card } from '@ai-pass/ui';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import styles from './trust.module.css';

const LEVELS: { level: CertificationLevel; label: string; blurb: string }[] = [
  { level: 'bronze', label: 'Bronze', blurb: 'Baseline functional tests, logging, annual review' },
  { level: 'silver', label: 'Silver', blurb: 'Expanded controls, drift monitoring, policy checks' },
  { level: 'gold', label: 'Gold', blurb: 'Continuous validation, audit evidence, risk scoring' },
  { level: 'platinum', label: 'Platinum', blurb: 'Enterprise continuous assurance for Gov / Defence' },
];

export default function TrustDashboardPage() {
  const engine = getTrustEngine();
  const dashboard = engine.getDashboard();
  const certified = engine.systems.list({ status: 'certified' });
  const avgTrust = dashboard.averageTrustScore;
  const highRisk =
    (dashboard.riskDistribution.high ?? 0) + (dashboard.riskDistribution.critical ?? 0);
  const complianceRate = Math.min(
    100,
    Math.round(
      ((dashboard.certifiedSystems || 0) /
        Math.max(
          dashboard.certifiedSystems + dashboard.failedValidations,
          certified.length || 1,
        )) *
        100,
    ),
  );

  return (
    <WorkspaceLayoutClient
      title="Trust Center"
      subtitle="Bronze → Platinum certification with Trust, Risk, and Compliance scores — TÜV + ISO + SOC for AI"
    >
      <div className={styles.dashboard}>
        <div className={styles.actions}>
          <Link href="/workspace/trust/certify">
            <Button variant="primary" size="sm">
              Start Certification
            </Button>
          </Link>
          <Link href="/workspace/trust/tests">
            <Button variant="secondary" size="sm">
              Test Builder
            </Button>
          </Link>
          <Link href="/workspace/trust/monitoring">
            <Button variant="secondary" size="sm">
              Monitoring
            </Button>
          </Link>
          <Link href="/workspace/trust/reports">
            <Button variant="secondary" size="sm">
              Reports
            </Button>
          </Link>
          <Link href="/workspace/trust/badges">
            <Button variant="secondary" size="sm">
              Badges
            </Button>
          </Link>
          <Link href="/workspace/trust/admin">
            <Button variant="secondary" size="sm">
              Administration
            </Button>
          </Link>
        </div>

        <Card padding="lg" className={styles.ladderCard}>
          <h2 className={styles.sectionTitle}>Certification ladder</h2>
          <div className={styles.ladder}>
            {LEVELS.map((item) => (
              <div key={item.level} className={`${styles.ladderStep} ${styles[`level_${item.level}`]}`}>
                <strong>{item.label}</strong>
                <span>{item.blurb}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className={styles.kpiGrid}>
          <Card padding="md" className={styles.kpi}>
            <div className={styles.kpiValue}>{avgTrust}</div>
            <div className={styles.kpiLabel}>Trust score</div>
          </Card>
          <Card padding="md" className={styles.kpi}>
            <div className={styles.kpiValue}>{highRisk}</div>
            <div className={styles.kpiLabel}>Risk score (high systems)</div>
          </Card>
          <Card padding="md" className={styles.kpi}>
            <div className={styles.kpiValue}>{complianceRate}%</div>
            <div className={styles.kpiLabel}>Compliance score</div>
          </Card>
          <Card padding="md" className={styles.kpi}>
            <div className={styles.kpiValue}>{dashboard.certifiedSystems}</div>
            <div className={styles.kpiLabel}>Certified systems</div>
          </Card>
          <Card padding="md" className={styles.kpi}>
            <div className={styles.kpiValue}>{dashboard.activeMonitoring}</div>
            <div className={styles.kpiLabel}>Active monitoring</div>
          </Card>
          <Card padding="md" className={styles.kpi}>
            <div className={styles.kpiValue}>{dashboard.expiringCerts.length}</div>
            <div className={styles.kpiLabel}>Expiring certs (30d)</div>
          </Card>
        </div>

        <Card padding="lg">
          <h2 className={styles.sectionTitle}>Certified systems</h2>
          {certified.map((sys) => {
            const cert = engine.certification.listBySystem(sys.id)[0];
            return (
              <div key={sys.id} className={styles.row}>
                <div>
                  <strong>{sys.productName}</strong>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>{sys.companyName}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {cert && <Badge variant="success">{cert.level}</Badge>}
                  <span>{cert?.scorecard.overall ?? '-'}</span>
                  <Link href={`/workspace/trust/systems/${sys.id}`}>
                    <Button variant="secondary" size="sm">
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </Card>

        <Card padding="lg">
          <h2 className={styles.sectionTitle}>Expiring certifications</h2>
          {dashboard.expiringCerts.length === 0 ? (
            <p style={{ fontSize: 13, opacity: 0.7 }}>No certifications expiring in the next 30 days.</p>
          ) : (
            dashboard.expiringCerts.map((c) => (
              <div key={c.id} className={styles.row}>
                <span>{c.productName}</span>
                <Badge variant="warning">Expires {new Date(c.validUntil).toLocaleDateString()}</Badge>
              </div>
            ))
          )}
        </Card>

        <Card padding="lg">
          <h2 className={styles.sectionTitle}>Recent monitoring alerts</h2>
          {dashboard.recentAlerts.map((e) => (
            <div key={e.id} className={styles.row}>
              <span>
                {e.type.replace('_', ' ')} - {e.systemId}
              </span>
              <Badge variant={e.severity === 'critical' ? 'danger' : 'warning'}>{e.severity}</Badge>
            </div>
          ))}
        </Card>

        <Card padding="lg">
          <h2 className={styles.sectionTitle}>Recent validation runs</h2>
          <Link href="/workspace/trust/runs" style={{ fontSize: 12 }}>
            View all →
          </Link>
          {dashboard.validationRuns.slice(0, 5).map((r) => (
            <div key={r.id} className={styles.row}>
              <span>{r.id}</span>
              <Badge
                variant={
                  r.recommendation === 'PASS' ? 'success' : r.recommendation === 'FAIL' ? 'danger' : 'outline'
                }
              >
                {r.recommendation ?? r.status}
              </Badge>
            </div>
          ))}
        </Card>
      </div>
    </WorkspaceLayoutClient>
  );
}
