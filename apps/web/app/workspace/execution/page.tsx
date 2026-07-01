'use client';

import { useState } from 'react';
import type { Execution, Plan } from '@ai-pass/runtime-core';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import styles from './execution.module.css';

export default function ExecutionPage() {
  const [goal, setGoal] = useState('Parse invoice PDF and recommend approval');
  const [plan, setPlan] = useState<Plan | null>(null);
  const [execution, setExecution] = useState<Execution | null>(null);
  const [loading, setLoading] = useState(false);

  const runPlan = async () => {
    setLoading(true);
    setExecution(null);
    const res = await fetch('/api/v1/runtime/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: { goal, membershipTier: 'professional', userId: 'demo-user' } }),
    });
    const data = await res.json();
    setPlan(data.plan ?? null);
    setLoading(false);
  };

  const runExecute = async () => {
    if (!plan) return;
    setLoading(true);
    const res = await fetch('/api/v1/runtime/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, mode: 'sequential', outputFormat: 'executive_summary' }),
    });
    const data = await res.json();
    setExecution(data.execution ?? null);
    setLoading(false);
  };

  return (
    <WorkspaceLayoutClient
      title="Execution Console"
      subtitle="Plan → route → execute → evaluate — all via runtime-core"
    >
      <section className={styles.panel}>
        <textarea
          className={styles.input}
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          rows={3}
          placeholder="Describe what the agent should accomplish…"
        />
        <div className={styles.actions}>
          <button type="button" className={styles.btn} onClick={runPlan} disabled={loading}>
            {loading ? 'Working…' : 'Generate Plan'}
          </button>
          <button type="button" className={styles.btnPrimary} onClick={runExecute} disabled={loading || !plan}>
            Execute Plan
          </button>
        </div>
      </section>

      {plan && (
        <section className={styles.card}>
          <h2>Execution Plan</h2>
          <p className={styles.meta}>{plan.summary} · ~${plan.estimatedCostUsd} est.</p>
          <ol className={styles.taskList}>
            {plan.tasks.map((t) => (
              <li key={t.id}>
                <strong>{t.name}</strong>
                <span>{t.type} · {t.estimatedCredits} credits</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {execution && (
        <section className={styles.card}>
          <h2>Live Execution</h2>
          <p className={styles.meta}>
            Status: {execution.status} · Confidence: {((execution.output?.confidence ?? 0) * 100).toFixed(0)}%
            · {execution.metrics.creditsUsed} credits
          </p>
          {execution.output?.formatted && typeof execution.output.formatted === 'string' && (
            <pre className={styles.output}>{execution.output.formatted}</pre>
          )}
          <h3>Logs</h3>
          <ul className={styles.logs}>
            {execution.logs.map((l) => (
              <li key={l.id} className={styles[`log_${l.level}`]}>{l.message}</li>
            ))}
          </ul>
        </section>
      )}
    </WorkspaceLayoutClient>
  );
}
