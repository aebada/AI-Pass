'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getTrustEngine } from '@ai-pass/trust-engine';
import { Badge, Button, Card } from '@ai-pass/ui';
import { WorkspaceLayoutClient } from '../../../../components/workspace/WorkspaceLayoutClient';
import { TrustCertBadge } from '../../../../components/trust/TrustCertBadge';
import styles from '../../trust.module.css';

export default function SystemDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const engine = getTrustEngine();
  const system = engine.systems.get(id);

  if (!system) {
    return (
      <WorkspaceLayoutClient title="System not found" subtitle="">
        <Badge variant="outline">No system for {id}</Badge>
      </WorkspaceLayoutClient>
    );
  }

  const certs = engine.certification.listBySystem(id);
  const runs = engine.listRuns(id);
  const risk = engine.assessRisk(id);
  const events = engine.monitoring.getEvents(id);

  return (
    <WorkspaceLayoutClient title={system.productName} subtitle={system.companyName}>
      <div className={styles.dashboard}>
        {system.resourceId && <TrustCertBadge resourceId={system.resourceId} />}

        <div className={styles.kpiGrid}>
          <Card padding="md" className={styles.kpi}>
            <div className={styles.kpiValue}>{certs[0]?.scorecard.overall ?? '-'}</div>
            <div className={styles.kpiLabel}>Trust score</div>
          </Card>
          <Card padding="md" className={styles.kpi}>
            <div className={styles.kpiValue}>{risk.riskScore}</div>
            <div className={styles.kpiLabel}>Risk score</div>
          </Card>
          <Card padding="md" className={styles.kpi}>
            <div className={styles.kpiValue}>{runs.length}</div>
            <div className={styles.kpiLabel}>Validation runs</div>
          </Card>
        </div>

        <Card padding="lg">
          <h2 className={styles.sectionTitle}>System scope</h2>
          <p style={{ fontSize: 13 }}>{system.useCase}</p>
          <p style={{ fontSize: 12, opacity: 0.7 }}>Type: {system.systemType} · Industry: {system.industry}</p>
          <p style={{ fontSize: 12, opacity: 0.7 }}>Models: {system.modelsUsed.join(', ')}</p>
        </Card>

        {certs[0] && (
          <Card padding="lg">
            <h2 className={styles.sectionTitle}>Certification</h2>
            <Badge variant="success">{certs[0].level}</Badge>
            <p style={{ fontSize: 13, marginTop: 8 }}>Valid until {new Date(certs[0].validUntil).toLocaleDateString()}</p>
            <Link href={certs[0].verificationUrl}><Button variant="secondary" size="sm">Public verification</Button></Link>
          </Card>
        )}

        <Card padding="lg">
          <h2 className={styles.sectionTitle}>Compliance frameworks</h2>
          {risk.complianceFrameworks.map((f) => (
            <div key={f.framework} className={styles.row}>
              <span>{f.framework.replace('_', ' ')}</span>
              <Badge variant={f.status === 'compliant' ? 'success' : 'warning'}>{f.status}</Badge>
            </div>
          ))}
        </Card>

        <Card padding="lg">
          <h2 className={styles.sectionTitle}>Monitoring events ({events.length})</h2>
          {events.slice(0, 5).map((e) => (
            <div key={e.id} className={styles.row}>
              <span>{e.type}</span>
              <Badge variant="outline">{e.severity}</Badge>
            </div>
          ))}
        </Card>
      </div>
    </WorkspaceLayoutClient>
  );
}
