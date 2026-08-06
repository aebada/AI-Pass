'use client';

import { useEffect, useState } from 'react';
import { NODE_TYPE_META } from '@ai-pass/automation-engine';
import styles from '../agents.module.css';
import { ModuleIcon } from '@ai-pass/ui';

interface WorkflowRow {
  id: string;
  name: string;
  description?: string;
  steps: Array<{ stepId: string; label?: string; type: string; skillId?: string }>;
  status: string;
}

export default function AgentWorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowRow[]>([]);
  const [agents, setAgents] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    fetch('/api/v1/agents')
      .then((r) => r.json())
      .then(async (d) => {
        setAgents(d.agents ?? []);
        const wfs: WorkflowRow[] = [];
        for (const a of d.agents ?? []) {
          const detail = await fetch(`/api/v1/agents/${a.id}`).then((r) => r.json());
          if (detail.workflow) wfs.push(detail.workflow);
        }
        setWorkflows(wfs);
      });
  }, []);

  return (
    <>
      <p className={styles.meta}>Visual workflow builder wired to automation-engine. Supports sequential, conditional, loops, parallel, retries, approvals, and delays.</p>

      <h3 className={styles.sectionTitle}>Node Types</h3>
      <div className={styles.grid}>
        {Object.entries(NODE_TYPE_META).slice(0, 8).map(([type, meta]) => (
          <div key={type} className={styles.card} style={{ borderColor: meta.color }}>
            <strong><ModuleIcon name={meta.icon} size={14} /> {meta.label}</strong>
            <p>{meta.description}</p>
          </div>
        ))}
      </div>

      <h3 className={styles.sectionTitle}>Agent Workflows</h3>
      {workflows.map((wf) => (
        <div key={wf.id} className={styles.card} style={{ marginBottom: 16 }}>
          <h3>{wf.name}</h3>
          {wf.description && <p>{wf.description}</p>}
          <div className={styles.flow}>
            {wf.steps.map((step, i) => (
              <span key={step.stepId}>
                {i > 0 && <span className={styles.flowArrow}>→</span>}
                <span className={styles.flowNode}>{step.label ?? step.stepId}</span>
              </span>
            ))}
          </div>
          <p className={styles.meta}>{wf.status} · {wf.steps.length} steps</p>
        </div>
      ))}

      {workflows.length === 0 && agents.length > 0 && (
        <p className={styles.meta}>Workflows are created when agents are registered. See seeded agents for templates.</p>
      )}
    </>
  );
}
