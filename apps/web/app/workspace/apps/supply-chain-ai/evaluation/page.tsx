'use client';

import { useState } from 'react';
import { defaultSupplyChainAIService, DEMO_TENANT_ID } from '@ai-pass/supply-chain-ai';
import styles from '../supply-chain-shell.module.css';

export default function EvaluationPage() {
  const events = defaultSupplyChainAIService.listEvents(DEMO_TENANT_ID).events;
  const { evaluations } = defaultSupplyChainAIService.listEvaluations(DEMO_TENANT_ID);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<(typeof evaluations)[0] | null>(evaluations[0] ?? null);

  async function runEvaluation(eventId: string) {
    setRunning(true);
    const res = await fetch('/api/v1/supply-chain-ai/evaluation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId }),
    });
    const data = await res.json();
    if (data.evaluation) setResult(data.evaluation);
    setRunning(false);
  }

  return (
    <div>
      <header className={styles.header}>
        <h1>Evaluation</h1>
        <p className={styles.muted}>Run multi-agent evaluation pipeline</p>
      </header>

      <div className={styles.card} style={{ marginBottom: 24 }}>
        <div className={styles.formGroup}>
          <label>Run evaluation for event</label>
          <div className={styles.actions}>
            {events.filter((e) => e.status !== 'closed').map((e) => (
              <button key={e.id} type="button" className={styles.btnPrimary} disabled={running} onClick={() => runEvaluation(e.id)}>
                {running ? 'Running…' : e.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {result && (
        <div className={styles.grid2}>
          <section className={styles.card}>
            <h2 style={{ fontSize: 14, margin: '0 0 16px' }}>Rankings</h2>
            <table className={styles.table}>
              <thead>
                <tr><th>Rank</th><th>Supplier</th><th>Score</th><th>Decision</th></tr>
              </thead>
              <tbody>
                {result.results.map((r) => (
                  <tr key={r.offerId}>
                    <td>#{r.rank}</td>
                    <td>{r.supplierName}</td>
                    <td>{r.score}</td>
                    <td>
                      <span className={r.decision === 'PASS' ? styles.badgePass : r.decision === 'FAIL' ? styles.badgeFail : styles.badgeInfo}>
                        {r.decision}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className={styles.muted} style={{ marginTop: 12 }}>Trust Score: {result.trustScore}/100</p>
          </section>

          <section className={styles.card}>
            <h2 style={{ fontSize: 14, margin: '0 0 16px' }}>Agent Results</h2>
            {result.agentResults.length === 0 ? (
              <p className={styles.muted}>Run evaluation to see agent outputs</p>
            ) : (
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {result.agentResults.map((a, i) => (
                  <li key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <strong>{a.agentName}</strong> - {a.summary}
                    <div className={styles.muted}>{a.creditsUsed} credits · {Math.round(a.confidence * 100)}% confidence</div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
