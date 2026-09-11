'use client';

import { DEMO_WORKFLOWS, DEMO_TENANT_ID } from '@ai-pass/invoice-ai';
import { ProGate } from '@ai-pass/ui';
import { useApp } from '../../../../components/premium/AppProviders';
import { InvoiceShell } from '../components/InvoiceShell';
import styles from '../invoice-ai.module.css';

const STEP_ICONS: Record<string, string> = {
  trigger: '⚡',
  extract: '📄',
  validate: '✓',
  fraud: '🛡',
  approve: '👤',
  notify: '📧',
  payment: '💳',
  condition: '◇',
};

export default function WorkflowBuilderPage() {
  const { user } = useApp();
  const workflows = DEMO_WORKFLOWS.filter((w) => w.tenantId === DEMO_TENANT_ID);

  return (
    <InvoiceShell showChat={false}>
      <ProGate
        requiredTier="pro"
        currentTier={user?.plan ?? 'free'}
        featureName="Workflow Builder"
      >
        {workflows.map((wf) => (
          <section key={wf.id} className={styles.card} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: 18 }}>{wf.name}</h2>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--ai-text-muted)' }}>
                  {wf.description} - mode: {wf.mode.replace(/_/g, ' ')}
                </p>
              </div>
              <span className={styles.badge} style={{ background: wf.isActive ? 'rgba(63,185,80,0.2)' : 'rgba(139,148,158,0.2)', color: wf.isActive ? '#3fb950' : '#8b949e' }}>
                {wf.isActive ? 'Active' : 'Inactive'} v{wf.version}
              </span>
            </div>

            <div className={styles.workflowSteps}>
              {wf.steps.map((step, i) => (
                <div key={step.id} className={styles.workflowStep}>
                  <div className={styles.stepIcon}>{STEP_ICONS[step.type] ?? (i + 1)}</div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{step.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--ai-text-muted)' }}>
                      {step.type}
                      {step.agentId ? ` → ${step.agentId}` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </ProGate>
    </InvoiceShell>
  );
}
