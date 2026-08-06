'use client';

import { useState } from 'react';
import { defaultSupplyChainAIService, DEMO_TENANT_ID } from '@ai-pass/supply-chain-ai';
import styles from '../supply-chain-shell.module.css';

export default function ReportsPage() {
  const { evaluations } = defaultSupplyChainAIService.listEvaluations(DEMO_TENANT_ID);
  const [artifacts, setArtifacts] = useState<Array<{ title: string; type: string; format: string }>>([]);

  async function generate(type: 'comparison' | 'decision_memo' | 'evidence_pack') {
    const evaluation = evaluations[0];
    if (!evaluation) return;
    const res = await fetch('/api/v1/supply-chain-ai/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ evaluationId: evaluation.id, type }),
    });
    const data = await res.json();
    if (data.artifact) {
      setArtifacts((a) => [...a, data.artifact]);
    }
  }

  return (
    <div>
      <header className={styles.header}>
        <h1>Reports</h1>
        <p className={styles.muted}>Generate comparison reports, decision memos, and evidence packs</p>
      </header>

      <div className={styles.actions} style={{ marginBottom: 24 }}>
        <button type="button" className={styles.btnPrimary} onClick={() => generate('comparison')}>Comparison Report</button>
        <button type="button" className={styles.btn} onClick={() => generate('decision_memo')}>Decision Memo</button>
        <button type="button" className={styles.btn} onClick={() => generate('evidence_pack')}>Evidence Pack</button>
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr><th>Title</th><th>Type</th><th>Format</th></tr>
          </thead>
          <tbody>
            {artifacts.length === 0 ? (
              <tr><td colSpan={3} className={styles.muted}>Generate a report to see artifacts</td></tr>
            ) : (
              artifacts.map((a, i) => (
                <tr key={i}>
                  <td>{a.title}</td>
                  <td>{a.type}</td>
                  <td>{a.format}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
