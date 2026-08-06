'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  clearWizardState,
  DEFAULT_WIZARD_FORM,
  isAgentsApiAvailable,
  loadWizardState,
  publishLocalAgent,
  saveAgentDraft,
  saveWizardState,
  type AgentWizardForm,
} from '../../../lib/agents-library';
import { DEMO_MARKETPLACE_SKILLS } from '../../../lib/skills-library';
import styles from '../agents.module.css';

const STEPS = [
  'Purpose',
  'Domain',
  'Inputs',
  'Model',
  'Skills',
  'Workflow',
  'Output',
  'Permissions',
  'Review',
  'Publish',
];

const AGENT_TYPES = ['Decision', 'Document', 'Analysis', 'Workflow', 'Automation', 'Customer Support', 'Finance', 'Procurement', 'Compliance', 'Research', 'Custom'];
const MODELS = [
  'auto-fast',
  'auto-standard',
  'auto-complex',
  'gpt-4o-mini',
  'gpt-4o',
  'gpt-5.6-terra',
  'claude-sonnet-5',
  'gemini-3.6-flash',
  'kimi-k3',
  'kimi-k2.7-code',
];

export default function AgentWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [agentId, setAgentId] = useState<string | undefined>();
  const [skills, setSkills] = useState<Array<{ id: string; name: string }>>([]);
  const [form, setForm] = useState<AgentWizardForm>(DEFAULT_WIZARD_FORM);
  const [saving, setSaving] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [toast, setToast] = useState('');
  const [publishedAgent, setPublishedAgent] = useState<{ id: string; name: string } | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    const saved = loadWizardState();
    if (saved) {
      setStep(saved.step);
      setAgentId(saved.agentId);
      setForm(saved.form);
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    saveWizardState({ step, agentId, form });
  }, [step, agentId, form]);

  useEffect(() => {
    let cancelled = false;

    async function loadSkills() {
      const apiOk = await isAgentsApiAvailable();
      if (cancelled) return;

      setDemoMode(!apiOk);

      if (apiOk) {
        try {
          const res = await fetch('/api/v1/agents/skills');
          const d = await res.json();
          if (!cancelled) setSkills(d.skills ?? []);
          return;
        } catch {
          if (!cancelled) setDemoMode(true);
        }
      }

      if (!cancelled) {
        setSkills(DEMO_MARKETPLACE_SKILLS.map((s) => ({ id: s.id, name: s.name })));
      }
    }

    loadSkills();
    return () => {
      cancelled = true;
    };
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2800);
  }, []);

  const toggleSkill = (id: string) => {
    setForm((f) => ({
      ...f,
      skillIds: f.skillIds.includes(id) ? f.skillIds.filter((s) => s !== id) : [...f.skillIds, id],
    }));
  };

  const saveViaApi = async (publish: boolean): Promise<{ id: string; name: string } | null> => {
    const res = await fetch('/api/v1/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        type: form.name.toLowerCase().replace(/\s+/g, '_') || 'custom_agent',
        agentType: form.agentType,
        inputSchema: JSON.parse(form.inputSchema),
        outputSchema: JSON.parse(form.outputSchema),
        skillIds: form.skillIds,
        modelId: form.modelId,
        riskLevel: form.riskLevel,
        status: publish ? 'active' : 'draft',
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const id = data.agent?.id as string | undefined;
    if (!id) return null;

    if (publish) {
      await fetch(`/api/v1/agents/${id}/publish`, { method: 'POST', body: '{}' });
    }

    return { id, name: form.name || 'Agent' };
  };

  const save = async (publish: boolean) => {
    if (!form.name.trim()) {
      showToast('Enter an agent name on the Purpose step');
      setStep(0);
      return;
    }

    try {
      JSON.parse(form.inputSchema);
      JSON.parse(form.outputSchema);
    } catch {
      showToast('Fix JSON in input or output schema');
      return;
    }

    setSaving(true);
    try {
      const apiOk = await isAgentsApiAvailable();
      let result: { id: string; name: string } | null = null;

      if (apiOk) {
        try {
          result = await saveViaApi(publish);
        } catch {
          result = null;
        }
      }

      if (!result) {
        setDemoMode(true);
        const agent = publish
          ? publishLocalAgent({ id: agentId, form })
          : saveAgentDraft({ id: agentId, form });
        result = { id: agent.id, name: agent.name };
      }

      setAgentId(result.id);

      if (publish) {
        clearWizardState();
        setPublishedAgent(result);
      } else {
        showToast('Draft saved to your workspace');
      }
    } catch {
      showToast('Could not save agent — check your configuration');
    } finally {
      setSaving(false);
    }
  };

  const closePublishModal = (target: 'execute' | 'history' | 'stay') => {
    const id = publishedAgent?.id;
    setPublishedAgent(null);
    if (target === 'execute') {
      router.push('/workspace/agents/execute');
    } else if (target === 'history') {
      router.push('/workspace/agents/history');
    } else if (id && !demoMode) {
      router.push(`/workspace/agents/${id}`);
    }
  };

  return (
    <>
      {demoMode && (
        <p className={styles.demoBanner} role="status">
          Demo mode on static hosting — agents persist in localStorage. Marketplace publish is a local stub until the Node.js API is connected.
        </p>
      )}

      <div className={styles.wizardSteps}>
        {STEPS.map((label, i) => (
          <span
            key={label}
            className={i === step ? styles.wizardStepActive : i < step ? styles.wizardStepDone : styles.wizardStep}
          >
            {i + 1}. {label}
          </span>
        ))}
      </div>

      <div className={styles.card}>
        {step === 0 && (
          <>
            <h3>Purpose</h3>
            <input className={styles.input} placeholder="Agent name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <textarea className={styles.textarea} rows={4} placeholder="What should this agent accomplish?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </>
        )}
        {step === 1 && (
          <>
            <h3>Domain</h3>
            <select className={styles.select} value={form.agentType} onChange={(e) => setForm({ ...form, agentType: e.target.value })}>
              {AGENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className={styles.select} value={form.riskLevel} onChange={(e) => setForm({ ...form, riskLevel: e.target.value })}>
              {['low', 'medium', 'high', 'critical'].map((r) => <option key={r} value={r}>{r} risk</option>)}
            </select>
          </>
        )}
        {step === 2 && (
          <>
            <h3>Input Schema</h3>
            <textarea className={styles.textarea} rows={6} value={form.inputSchema} onChange={(e) => setForm({ ...form, inputSchema: e.target.value })} />
          </>
        )}
        {step === 3 && (
          <>
            <h3>Model</h3>
            <p className={styles.meta}>All inference routes through Provider Hub with auto-routing.</p>
            <select className={styles.select} value={form.modelId} onChange={(e) => setForm({ ...form, modelId: e.target.value })}>
              {MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </>
        )}
        {step === 4 && (
          <>
            <h3>Skills</h3>
            <div className={styles.grid}>
              {skills.map((s) => (
                <label key={s.id} className={styles.card} style={{ cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.skillIds.includes(s.id)} onChange={() => toggleSkill(s.id)} />
                  {' '}{s.name}
                </label>
              ))}
            </div>
          </>
        )}
        {step === 5 && (
          <>
            <h3>Workflow</h3>
            <p className={styles.meta}>Sequential pipeline: {form.skillIds.join(' → ') || 'No skills selected'}</p>
            <div className={styles.flow}>
              {form.skillIds.map((id, i) => (
                <span key={id}>
                  {i > 0 && <span className={styles.flowArrow}>→</span>}
                  <span className={styles.flowNode}>{skills.find((s) => s.id === id)?.name ?? id}</span>
                </span>
              ))}
            </div>
          </>
        )}
        {step === 6 && (
          <>
            <h3>Output Schema</h3>
            <textarea className={styles.textarea} rows={6} value={form.outputSchema} onChange={(e) => setForm({ ...form, outputSchema: e.target.value })} />
          </>
        )}
        {step === 7 && (
          <>
            <h3>Permissions</h3>
            <p className={styles.meta}>Governance policies enforced before execute. Wallet credits deducted per skill.</p>
            <ul className={styles.logs}>
              <li>wallet.deduct — required</li>
              <li>documents.read — if OCR/Vision skills attached</li>
              <li>governance.read — if Compliance skills attached</li>
            </ul>
          </>
        )}
        {step === 8 && (
          <>
            <h3>Review</h3>
            <pre className={styles.output}>{JSON.stringify(form, null, 2)}</pre>
          </>
        )}
        {step === 9 && (
          <>
            <h3>Publish</h3>
            <p>Save as draft or publish to your workspace marketplace stub.</p>
            <div className={styles.actions}>
              <button type="button" className={styles.btn} disabled={saving} onClick={() => save(false)}>Save Draft</button>
              <button type="button" className={styles.btnPrimary} disabled={saving} onClick={() => save(true)}>
                {saving ? 'Saving…' : 'Publish'}
              </button>
            </div>
          </>
        )}
      </div>

      {step < 9 && (
        <div className={styles.actions}>
          {step > 0 && <button type="button" className={styles.btn} onClick={() => setStep(step - 1)}>Back</button>}
          <button type="button" className={styles.btnPrimary} onClick={() => setStep(step + 1)}>Next</button>
          <button type="button" className={styles.btn} disabled={saving} onClick={() => save(false)}>Save Draft</button>
        </div>
      )}

      {toast && <div className={styles.toast} role="status">{toast}</div>}

      {publishedAgent && (
        <div className={styles.modalOverlay} role="dialog" aria-labelledby="publish-success-title">
          <div className={styles.modal}>
            <h3 id="publish-success-title">Agent published to your workspace</h3>
            <p>
              <strong>{publishedAgent.name}</strong> is now available locally
              {demoMode ? ' (demo mode — marketplace listing is a stub on static hosting)' : ''}.
              Run it from Execute or review past runs in History.
            </p>
            <div className={styles.modalActions}>
              <button type="button" className={styles.btnPrimary} onClick={() => closePublishModal('execute')}>
                Go to Execute
              </button>
              <button type="button" className={styles.btn} onClick={() => closePublishModal('history')}>
                View History
              </button>
              <Link href="/workspace/marketplace" className={styles.btn} onClick={() => setPublishedAgent(null)}>
                Marketplace
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
