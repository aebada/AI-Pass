'use client';

import { useState } from 'react';
import { DEMO_COMPANY, DEMO_OPTIMIZATION_RECS, defaultPresenceAuditPlatform } from '@ai-pass/presence-audit';
import { PresenceAuditShell, SeverityBadge } from '../components/PresenceAuditShell';
import styles from '../presence-audit.module.css';

export default function OptimizationCenterPage() {
  const [simulation, setSimulation] = useState(
    defaultPresenceAuditPlatform.simulation.list(DEMO_COMPANY.id)[0] ?? null,
  );

  const runSimulation = () => {
    const result = defaultPresenceAuditPlatform.simulation.simulate(
      DEMO_COMPANY,
      'landing_page',
      { topic: 'AI visibility intelligence' },
    );
    setSimulation(result);
  };

  return (
    <PresenceAuditShell>
      <section className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className={styles.cardTitle}>Recommendations</h2>
          <button
            type="button"
            onClick={runSimulation}
            className={styles.subNavLinkActive}
            style={{ border: 'none', cursor: 'pointer', padding: '8px 16px' }}
          >
            Run simulation
          </button>
        </div>
        <div className={styles.list} style={{ marginTop: 12 }}>
          {DEMO_OPTIMIZATION_RECS.map((rec) => (
            <div key={rec.id} className={styles.listItem}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                <SeverityBadge severity={rec.impact === 'high' ? 'critical' : rec.impact === 'medium' ? 'medium' : 'low'} />
                <strong>{rec.title}</strong>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>+{rec.estimatedLift}% est.</span>
              </div>
              <p style={{ fontSize: 13, margin: '0 0 8px', color: 'var(--text-muted)' }}>{rec.description}</p>
              <ul style={{ fontSize: 12, margin: 0, paddingLeft: 18 }}>
                {rec.actionItems.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {simulation && (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Simulation mode</h2>
          <p style={{ fontSize: 13 }}>{simulation.summary}</p>
          <div className={styles.grid} style={{ marginTop: 12 }}>
            <div>
              <p className={styles.cardTitle}>Predicted visibility lift</p>
              <p className={styles.statValue} style={{ fontSize: 22 }}>+{simulation.predictedVisibilityLift}%</p>
            </div>
            <div>
              <p className={styles.cardTitle}>Predicted ranking lift</p>
              <p className={styles.statValue} style={{ fontSize: 22 }}>+{simulation.predictedRankingLift}</p>
            </div>
          </div>
        </section>
      )}
    </PresenceAuditShell>
  );
}
