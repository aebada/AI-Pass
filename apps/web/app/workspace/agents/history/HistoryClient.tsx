'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../agents.module.css';

interface ExecutionRow {
  id: string;
  agentId: string;
  agentName?: string;
  status: string;
  creditsUsed: number;
  latencyMs?: number;
  startedAt: string;
  output?: { decision: string; confidence: number };
}

export default function ExecutionHistoryClient() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('id');
  const [executions, setExecutions] = useState<ExecutionRow[]>([]);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch('/api/v1/agents/executions?limit=50')
      .then((r) => r.json())
      .then((d) => setExecutions(d.executions ?? []));
  }, []);

  useEffect(() => {
    if (highlightId) {
      fetch(`/api/v1/agents/executions/${highlightId}`)
        .then((r) => r.json())
        .then((d) => setDetail(d.execution ?? null));
    }
  }, [highlightId]);

  return (
    <>
      <div className={styles.grid}>
        {executions.map((e) => (
          <div key={e.id} className={styles.card}>
            <h3>{e.agentName ?? e.agentId}</h3>
            <p className={styles.meta}>
              {e.status} · {e.output?.decision} · {e.creditsUsed} credits · {new Date(e.startedAt).toLocaleString()}
            </p>
            <Link href={`/workspace/agents/history?id=${e.id}`} className={styles.btn}>View details</Link>
          </div>
        ))}
      </div>

      {detail && (
        <div className={styles.card} style={{ marginTop: 24 }}>
          <h3>Execution Detail</h3>
          <pre className={styles.output}>{JSON.stringify(detail, null, 2)}</pre>
        </div>
      )}
    </>
  );
}
