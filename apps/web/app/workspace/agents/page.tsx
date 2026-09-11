'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './agents.module.css';

interface AgentRow {
  id: string;
  name: string;
  description: string;
  status: string;
  agentType: string;
  trustScore?: number;
  skillIds: string[];
}

interface MonitoringSnapshot {
  executionCount: number;
  runningCount: number;
  failureRate: number;
  avgConfidence: number;
  creditsConsumed: number;
  health: string;
}

export default function AgentsDashboardPage() {
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [monitoring, setMonitoring] = useState<MonitoringSnapshot | null>(null);
  const [recent, setRecent] = useState<Array<{ id: string; agentName?: string; status: string; creditsUsed: number }>>([]);

  useEffect(() => {
    fetch('/api/v1/agents')
      .then((r) => r.json())
      .then((d) => {
        setAgents(d.agents ?? []);
        setMonitoring(d.monitoring ?? null);
      });
    fetch('/api/v1/agents/executions?limit=5')
      .then((r) => r.json())
      .then((d) => setRecent(d.executions ?? []));
  }, []);

  const active = agents.filter((a) => a.status === 'active');
  const drafts = agents.filter((a) => a.status === 'draft');
  const successRate = monitoring ? (1 - monitoring.failureRate) * 100 : 0;

  return (
    <>
      <div className={styles.actions}>
        <Link href="/workspace/agents/new" className={styles.btnPrimary}>New Agent</Link>
        <Link href="/workspace/agents/execute" className={styles.btn}>Run Agent</Link>
        <Link href="/workspace/marketplace" className={styles.btn}>Marketplace</Link>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <p className={styles.statValue}>{active.length}</p>
          <p className={styles.statLabel}>Active Agents</p>
        </div>
        <div className={styles.stat}>
          <p className={styles.statValue}>{drafts.length}</p>
          <p className={styles.statLabel}>Drafts</p>
        </div>
        <div className={styles.stat}>
          <p className={styles.statValue}>{successRate.toFixed(0)}%</p>
          <p className={styles.statLabel}>Success Rate</p>
        </div>
        <div className={styles.stat}>
          <p className={styles.statValue}>{monitoring?.creditsConsumed ?? 0}</p>
          <p className={styles.statLabel}>Credits Used</p>
        </div>
        <div className={styles.stat}>
          <p className={styles.statValue}>{monitoring?.health ?? '-'}</p>
          <p className={styles.statLabel}>Health</p>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Agents</h2>
      <div className={styles.grid}>
        {agents.map((a) => (
          <Link key={a.id} href={`/workspace/agents/${a.id}`} className={styles.card} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>{a.name}</h3>
              <span className={a.status === 'active' ? styles.badgeActive : styles.badgeDraft}>{a.status}</span>
            </div>
            <p>{a.description}</p>
            <p className={styles.meta}>
              {a.agentType} · {a.skillIds.length} skills
              {a.trustScore != null && ` · Trust ${a.trustScore}`}
            </p>
          </Link>
        ))}
      </div>

      <h2 className={styles.sectionTitle}>Recently Executed</h2>
      <div className={styles.grid}>
        {recent.map((e) => (
          <div key={e.id} className={styles.card}>
            <h3>{e.agentName ?? e.id}</h3>
            <p className={styles.meta}>{e.status} · {e.creditsUsed} credits</p>
            <Link href={`/workspace/agents/history?id=${e.id}`} className={styles.btn} style={{ marginTop: 8 }}>
              View logs
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
