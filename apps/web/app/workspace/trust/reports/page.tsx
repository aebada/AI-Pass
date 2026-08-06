'use client';

import { getTrustEngine } from '@ai-pass/trust-engine';
import { Badge, Button, Card } from '@ai-pass/ui';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import styles from '../trust.module.css';

export default function ReportsPage() {
  const engine = getTrustEngine();
  const reports = engine.reporting.list();

  return (
    <WorkspaceLayoutClient title="Trust Reports" subtitle="Executive, technical, risk, and compliance reports">
      <Card padding="lg">
        {reports.map((r) => {
          const sys = engine.systems.get(r.systemId);
          return (
            <div key={r.id} className={styles.row}>
              <div>
                <strong>{r.title}</strong>
                <div style={{ fontSize: 11, opacity: 0.6 }}>{sys?.productName} · {r.type}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Badge variant="outline">{r.type}</Badge>
                {(['json', 'html', 'csv', 'pdf'] as const).map((fmt) => (
                  <Button key={fmt} variant="secondary" size="sm" onClick={() => {
                    const exp = engine.reporting.export(r.id, fmt);
                    if (exp) console.log(`Export ${exp.filename}`, exp.content.slice(0, 100));
                  }}>
                    {fmt.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          );
        })}
      </Card>
    </WorkspaceLayoutClient>
  );
}
