'use client';

import { getTrustEngine } from '@ai-pass/trust-engine';
import { Badge, Card } from '@ai-pass/ui';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import styles from '../trust.module.css';

export default function TrustAdminPage() {
  const engine = getTrustEngine();
  const logs = engine.audit.list();

  return (
    <WorkspaceLayoutClient title="Trust Administration" subtitle="Immutable audit logs and system registry">
      <Card padding="lg">
        <h2 className={styles.sectionTitle}>Registered AI systems ({engine.systems.list().length})</h2>
        {engine.systems.list().map((s) => (
          <div key={s.id} className={styles.row}>
            <span>{s.productName}</span>
            <Badge variant="outline">{s.status}</Badge>
          </div>
        ))}
      </Card>

      <Card padding="lg" style={{ marginTop: 16 }}>
        <h2 className={styles.sectionTitle}>Audit log</h2>
        {logs.slice(0, 20).map((l) => (
          <div key={l.id} className={styles.row}>
            <div>
              <strong>{l.action}</strong>
              <div style={{ fontSize: 11, opacity: 0.6 }}>{l.resourceType}/{l.resourceId}</div>
            </div>
            <code style={{ fontSize: 10 }}>{l.immutableHash.slice(0, 16)}…</code>
          </div>
        ))}
      </Card>
    </WorkspaceLayoutClient>
  );
}
