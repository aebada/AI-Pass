'use client';

import { getTrustEngine } from '@ai-pass/trust-engine';
import { Badge, Card } from '@ai-pass/ui';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import styles from '../trust.module.css';

export default function MonitoringPage() {
  const engine = getTrustEngine();
  const events = engine.monitoring.getEvents();
  const active = engine.monitoring.getActiveCount();

  return (
    <WorkspaceLayoutClient title="Monitoring Dashboard" subtitle="Continuous trust monitoring - drift, hallucination, policy violations">
      <div className={styles.kpiGrid}>
        <Card padding="md" className={styles.kpi}>
          <div className={styles.kpiValue}>{active}</div>
          <div className={styles.kpiLabel}>Systems monitored</div>
        </Card>
        <Card padding="md" className={styles.kpi}>
          <div className={styles.kpiValue}>{events.filter((e) => e.triggersRevalidation).length}</div>
          <div className={styles.kpiLabel}>Revalidation triggers</div>
        </Card>
      </div>

      <Card padding="lg" style={{ marginTop: 16 }}>
        <h2 className={styles.sectionTitle}>Monitoring events</h2>
        {events.map((e) => {
          const sys = engine.systems.get(e.systemId);
          return (
            <div key={e.id} className={styles.row}>
              <div>
                <strong>{e.type.replace(/_/g, ' ')}</strong>
                <div style={{ fontSize: 11, opacity: 0.6 }}>{sys?.productName} · {new Date(e.timestamp).toLocaleString()}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Badge variant={e.severity === 'critical' ? 'danger' : e.severity === 'high' ? 'warning' : 'outline'}>
                  {e.severity}
                </Badge>
                {e.triggersRevalidation && <Badge variant="pro">Revalidate</Badge>}
              </div>
            </div>
          );
        })}
      </Card>
    </WorkspaceLayoutClient>
  );
}
