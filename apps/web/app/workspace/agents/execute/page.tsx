'use client';

import { useEffect, useState } from 'react';
import styles from '../agents.module.css';

interface AgentOption {
  id: string;
  name: string;
}

interface ExecutionResult {
  id: string;
  status: string;
  output?: { decision: string; confidence: number; reasons: string[]; evidence: string[] };
  steps: Array<{ stepId: string; name?: string; durationMs: number; status: string }>;
  logs: Array<{ id: string; level: string; message: string }>;
  creditsUsed: number;
  latencyMs?: number;
}

export default function AgentExecutePage() {
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [agentId, setAgentId] = useState('');
  const [input, setInput] = useState('{"query":"Parse invoice and recommend approval"}');
  const [execution, setExecution] = useState<ExecutionResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/v1/agents')
      .then((r) => r.json())
      .then((d) => {
        const list = d.agents ?? [];
        setAgents(list);
        if (list[0]) setAgentId(list[0].id);
      });
  }, []);

  const run = async () => {
    if (!agentId) return;
    setLoading(true);
    setExecution(null);
    const res = await fetch(`/api/v1/agents/${agentId}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: JSON.parse(input) }),
    });
    const data = await res.json();
    setExecution(data.execution ?? null);
    setLoading(false);
  };

  return (
    <>
      <div className={styles.card}>
        <label>
          <span className={styles.meta}>Agent</span>
          <select className={styles.select} value={agentId} onChange={(e) => setAgentId(e.target.value)}>
            {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </label>
        <label>
          <span className={styles.meta}>Input (JSON)</span>
          <textarea className={styles.textarea} rows={4} value={input} onChange={(e) => setInput(e.target.value)} />
        </label>
        <button type="button" className={styles.btnPrimary} onClick={run} disabled={loading || !agentId}>
          {loading ? 'Executing…' : 'Execute'}
        </button>
      </div>

      {execution && (
        <div className={styles.card}>
          <h3>Live Execution</h3>
          <p className={styles.meta}>
            {execution.status} · Decision: {execution.output?.decision} ·
            Confidence: {((execution.output?.confidence ?? 0) * 100).toFixed(0)}% ·
            {execution.creditsUsed} credits · {execution.latencyMs}ms
          </p>

          <h4>Steps</h4>
          <ol className={styles.logs}>
            {execution.steps.map((s) => (
              <li key={s.stepId}>{s.name ?? s.stepId} · {s.durationMs}ms · {s.status}</li>
            ))}
          </ol>

          <h4>Logs</h4>
          <ul className={styles.logs}>
            {execution.logs.map((l) => (
              <li key={l.id} className={styles[`log_${l.level}` as keyof typeof styles]}>{l.message}</li>
            ))}
          </ul>

          {execution.output && (
            <>
              <h4>Evidence</h4>
              <ul className={styles.logs}>
                {execution.output.evidence.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </>
          )}
        </div>
      )}
    </>
  );
}
