'use client';

import Link from 'next/link';
import { getTrustEngine } from '@ai-pass/trust-engine';
import { Badge, Card } from '@ai-pass/ui';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import styles from '../trust.module.css';

export default function ValidationRunsPage() {
  const engine = getTrustEngine();
  const runs = engine.listRuns();

  return (
    <WorkspaceLayoutClient title="Validation Runs" subtitle="History of trust validation executions">
      <Card padding="lg">
        {runs.map((r) => {
          const sys = engine.systems.get(r.systemId);
          return (
            <div key={r.id} className={styles.row}>
              <div>
                <strong>{sys?.productName ?? r.systemId}</strong>
                <div style={{ fontSize: 11, opacity: 0.6 }}>{r.id} · {new Date(r.startedAt).toLocaleString()}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span>{r.scorecard?.overall ?? '-'}</span>
                <Badge variant={r.recommendation === 'PASS' ? 'success' : r.recommendation === 'FAIL' ? 'danger' : 'outline'}>
                  {r.recommendation ?? r.status}
                </Badge>
                <Link href={`/workspace/trust/systems/${r.systemId}`} style={{ fontSize: 12 }}>System →</Link>
              </div>
            </div>
          );
        })}
      </Card>
    </WorkspaceLayoutClient>
  );
}
