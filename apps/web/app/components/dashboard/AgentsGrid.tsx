'use client';

import Link from 'next/link';
import styles from './AgentsGrid.module.css';
import type { AgentCard } from './dashboardData';

export function AgentsGrid({ agents, subtitle }: { agents: AgentCard[]; subtitle?: string }) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Your agents</h2>
          <p className={styles.subtitle}>{subtitle ?? (agents.length === 0 ? 'Create your first agent to get started' : 'Your active agents')}</p>
        </div>
        <Link href="/studio" className={styles.manage}>
          Manage agents →
        </Link>
      </div>

      <div className={styles.grid}>
        {agents.map((agent) => (
          <article key={agent.id} className={styles.card}>
            <div className={styles.cardTop}>
              <span className={styles.icon} style={{ background: agent.iconBg }}>
                {agent.icon}
              </span>
              <div>
                <h3 className={styles.name}>{agent.name}</h3>
                <p className={styles.category}>
                  {agent.category.toUpperCase()} · {agent.llm.toUpperCase()}
                </p>
              </div>
            </div>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statVal}>{agent.runs}</span>
                <span className={styles.statLabel}>Runs</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statVal}>{agent.successRate}%</span>
                <span className={styles.statLabel}>Success</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statVal}>${agent.credits}</span>
                <span className={styles.statLabel}>Credits</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
