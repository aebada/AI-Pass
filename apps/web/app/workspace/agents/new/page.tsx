'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
const MODELS = ['gpt-4o', 'gpt-4o-mini', 'claude-3-5-sonnet', 'gemini-2.0-flash'];

export default function AgentWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [skills, setSkills] = useState<Array<{ id: string; name: string }>>([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    agentType: 'Custom' as string,
    inputSchema: '{"type":"object","properties":{"query":{"type":"string"}}}',
    outputSchema: '{"type":"object","properties":{"decision":{"type":"string"}}}',
    modelId: 'gpt-4o',
    skillIds: [] as string[],
    riskLevel: 'medium' as string,
    publish: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/v1/agents/skills')
      .then((r) => r.json())
      .then((d) => setSkills(d.skills ?? []));
  }, []);

  const toggleSkill = (id: string) => {
    setForm((f) => ({
      ...f,
      skillIds: f.skillIds.includes(id) ? f.skillIds.filter((s) => s !== id) : [...f.skillIds, id],
    }));
  };

  const save = async (publish: boolean) => {
    setSaving(true);
    try {
      const res = await fetch('/api/v1/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          type: form.name.toLowerCase().replace(/\s+/g, '_'),
          agentType: form.agentType,
          inputSchema: JSON.parse(form.inputSchema),
          outputSchema: JSON.parse(form.outputSchema),
          skillIds: form.skillIds,
          modelId: form.modelId,
          riskLevel: form.riskLevel,
          status: publish ? 'active' : 'draft',
        }),
      });
      const data = await res.json();
      if (data.agent?.id && publish) {
        await fetch(`/api/v1/agents/${data.agent.id}/publish`, { method: 'POST', body: '{}' });
      }
      router.push(`/workspace/agents/${data.agent.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
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
            <p>Save as draft or publish to marketplace.</p>
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
    </>
  );
}
