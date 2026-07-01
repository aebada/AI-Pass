'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import styles from '../agents.module.css';

export default function AgentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [agent, setAgent] = useState<Record<string, unknown> | null>(null);
  const [metrics, setMetrics] = useState<Record<string, unknown> | null>(null);
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<string>('');
  const [input, setInput] = useState('{"query":"demo task"}');

  useEffect(() => {
    fetch(`/api/v1/agents/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setAgent(d.agent ?? null);
        setMetrics(d.metrics ?? null);
      });
  }, [id]);

  const execute = async () => {
    setExecuting(true);
    try {
      const res = await fetch(`/api/v1/agents/${id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: JSON.parse(input) }),
      });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setResult(String(e));
    } finally {
      setExecuting(false);
    }
  };

  if (!agent) return <p className={styles.meta}>Loading…</p>;

  return (
    <>
      <div className={styles.card}>
        <h2>{String(agent.name)}</h2>
        <p>{String(agent.description)}</p>
        <p className={styles.meta}>
          {String(agent.agentType)} · v{String(agent.currentVersion)} · {String(agent.status)}
          {agent.trustScore != null && ` · Trust ${agent.trustScore}`}
        </p>
      </div>

      {metrics && (
        <div className={styles.stats}>
          <div className={styles.stat}>
            <p className={styles.statValue}>{String(metrics.executionCount ?? 0)}</p>
            <p className={styles.statLabel}>Executions</p>
          </div>
          <div className={styles.stat}>
            <p className={styles.statValue}>{((Number(metrics.successRate ?? 0)) * 100).toFixed(0)}%</p>
            <p className={styles.statLabel}>Success</p>
          </div>
          <div className={styles.stat}>
            <p className={styles.statValue}>{String(metrics.creditsUsed ?? 0)}</p>
            <p className={styles.statLabel}>Credits</p>
          </div>
        </div>
      )}

      <h3 className={styles.sectionTitle}>Execute</h3>
      <textarea className={styles.textarea} rows={4} value={input} onChange={(e) => setInput(e.target.value)} />
      <button type="button" className={styles.btnPrimary} onClick={execute} disabled={executing}>
        {executing ? 'Running…' : 'Execute via runtime-core'}
      </button>
      {result && <pre className={styles.output}>{result}</pre>}
    </>
  );
}
